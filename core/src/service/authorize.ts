/**
 * authorize - Entrypoint único del Elixir Core
 * 
 * Secuencia obligatoria:
 * 1. Generar trace_id interno
 * 2. Incrementar authorize_total
 * 3. Validar schema y límites (si falla → DENY + métrica)
 * 4. Validar deadline (si vencido → DENY + métrica)
 * 5. Ejecutar pipeline mínimo (baseline)
 * 6. Default final → DENY
 * 7. Log seguro interno (sin reglas, sin Nectar)
 */

import { Decision } from '../domain/decision';
import { AuthorizationRequest } from '../domain/request';
import { Validator } from '../runtime/validator';
import { Deadline } from '../runtime/deadline';
import { FailClosedGuard } from '../runtime/guards';
import { Clock } from '../runtime/clock';
import { Metrics } from '../obs/metrics';
import { Logger, LogEntry } from '../obs/logger';
import { RulePipeline } from '../rules/Pipeline';
import { RuleContext } from '../rules/RuleContext';
import { ExplicitAllowStage } from '../rules/stages/ExplicitAllowStage';
import { NectarCollector } from '../nectar/NectarCollector';
import { randomBytes } from 'crypto';

export class AuthorizeService {
  private validator: Validator;
  private deadline: Deadline;
  private clock: Clock;
  private metrics: Metrics;
  private logger: Logger;
  private pipeline: RulePipeline;
  private explicitAllowStage: ExplicitAllowStage;
  private nectarCollector: NectarCollector;

  constructor(pipeline?: RulePipeline, explicitAllowStage?: ExplicitAllowStage) {
    this.clock = new Clock();
    this.validator = new Validator();
    this.deadline = new Deadline(this.clock);
    this.metrics = new Metrics();
    this.logger = new Logger();
    this.nectarCollector = new NectarCollector(this.clock);
    // Pipeline con lista vacía por defecto (retorna DENY)
    // Permite inyección opcional para testing
    this.pipeline = pipeline ?? new RulePipeline([]);
    // ExplicitAllowStage: única fuente de ALLOW
    // Permite inyección opcional para testing
    this.explicitAllowStage = explicitAllowStage ?? new ExplicitAllowStage();
  }

  authorize(request: unknown): Decision {
    const startTime = this.clock.now();
    const traceId = randomBytes(16).toString('hex');

    // 1. Generar trace_id interno (ya generado arriba)
    // 2. Incrementar authorize_total
    this.metrics.incrementAuthorizeTotal();

    // Ejecutar con fail-closed guard
    const result = FailClosedGuard.execute(
      () => {
        // 3. Validar schema y límites
        let validatedRequest: AuthorizationRequest;
        try {
          validatedRequest = this.validator.validate(request);
        } catch (error) {
          this.metrics.incrementAuthorizeError();
          throw error; // Será capturado por FailClosedGuard
        }

        // Nectar: calcular señal interna (NO afecta decisiones)
        let nectarContext;
        try {
          nectarContext = this.nectarCollector.collect(validatedRequest);
          // Registrar métrica agregada (NO exponer valor por request)
          this.metrics.incrementNectarSignal(nectarContext.signal);
        } catch (error) {
          // Si NectarCollector falla, continuar sin Nectar (fail-closed)
          // NO afecta el flujo de decisión
        }

        // 4. Validar deadline
        try {
          this.deadline.validate(validatedRequest);
        } catch (error) {
          this.metrics.incrementAuthorizeTimeout();
          throw error; // Será capturado por FailClosedGuard
        }

        // 5. Ejecutar pipeline deny-only
        const ruleContext: RuleContext = {
          request: validatedRequest,
          clock: this.clock,
          deadline: this.deadline,
          trace_id: traceId,
          nectarContext: nectarContext // Transporte interno, NO usado para decidir
        };
        const pipelineResult = this.pipeline.run(ruleContext);
        
        // Pipeline puede devolver PASS o DENY
        // Si pipeline devuelve DENY → DENY (no se puede sobreescribir)
        if (pipelineResult.type === 'DENY') {
          return Decision.DENY;
        }
        
        // 6. Ejecutar ExplicitAllowStage (solo si pipeline no negó)
        const explicitAllowResult = this.explicitAllowStage.execute(ruleContext);
        
        // Si ExplicitAllowStage devuelve ALLOW → ALLOW
        if (explicitAllowResult.type === 'ALLOW') {
          return Decision.ALLOW;
        }
        
        // En cualquier otro caso → DENY (default deny)
        return Decision.DENY;
      },
      () => {
        // Error handler: siempre DENY
        this.metrics.incrementAuthorizeDeny();
        return Decision.DENY;
      }
    );

    // 6. Default final → DENY (ya manejado arriba)
    // 7. Log seguro interno
    const latencyMs = this.clock.now() - startTime;
    const logEntry: LogEntry = {
      trace_id: traceId,
      result: result,
      latency_ms: latencyMs,
      timestamp: this.clock.now()
    };
    this.logger.log(logEntry);

    // Actualizar métricas según resultado
    if (result === Decision.ALLOW) {
      this.metrics.incrementAuthorizeAllow();
    } else {
      this.metrics.incrementAuthorizeDeny();
    }

    return result;
  }
}

// Exportar función de conveniencia
export function authorize(request: unknown): Decision {
  const service = new AuthorizeService();
  return service.authorize(request);
}

