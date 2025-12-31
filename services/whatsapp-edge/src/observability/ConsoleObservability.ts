/**
 * Implementación de observabilidad con logs estructurados a consola
 * Separación de logs operativos, errores y métricas
 * NO registra: contenido, PII, números telefónicos, decisiones del Core
 */

import { IObservability, Event, Metric } from '../contracts/Observability';

export class ConsoleObservability implements IObservability {
  // Contadores agregados para métricas
  private metrics: Map<string, number> = new Map();
  private lastMetricsEmit: number = Date.now();
  private readonly METRICS_EMIT_INTERVAL_MS = 60000; // 1 minuto

  recordEvent(event: Event): void {
    // Separar logs por tipo: operativos vs errores
    const logLevel = this.getLogLevel(event.type);
    
    const logEntry = {
      level: logLevel,
      type: 'event',
      event_type: event.type,
      handoff_id: event.handoff_id,
      session_id: event.session_id,
      timestamp: event.timestamp,
      error_type: event.error_type,
      cause: event.cause
    };
    
    // Emitir a stderr para errores, stdout para operativos
    const output = logLevel === 'error' ? console.error : console.log;
    output(JSON.stringify(logEntry));

    // Actualizar contadores agregados
    this.updateCounters(event);
    
    // Emitir métricas periódicamente
    this.emitAggregatedMetricsIfNeeded();
  }

  recordMetric(metric: Metric): void {
    // Log estructurado de métrica agregada
    const logEntry = {
      level: 'metric',
      type: 'metric',
      name: metric.name,
      value: metric.value,
      timestamp: metric.timestamp,
      tags: metric.tags
    };
    
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Determina nivel de log según tipo de evento
   */
  private getLogLevel(eventType: Event['type']): 'info' | 'error' {
    const errorEvents: Event['type'][] = [
      'handoff_resolution_failed',
      'provider_execution_failed',
      'kill_switch_activated' // Kill-switch activado es evento crítico
    ];
    
    return errorEvents.includes(eventType) ? 'error' : 'info';
  }

  /**
   * Actualiza contadores agregados para métricas
   */
  private updateCounters(event: Event): void {
    // Contador por tipo de evento
    const eventKey = `event.${event.type}`;
    this.metrics.set(eventKey, (this.metrics.get(eventKey) || 0) + 1);

    // Contador por tipo de error (si aplica)
    if (event.error_type) {
      const errorKey = `error.${event.error_type}`;
      this.metrics.set(errorKey, (this.metrics.get(errorKey) || 0) + 1);
    }
  }

  /**
   * Emite métricas agregadas periódicamente
   */
  private emitAggregatedMetricsIfNeeded(): void {
    const now = Date.now();
    if (now - this.lastMetricsEmit >= this.METRICS_EMIT_INTERVAL_MS) {
      this.emitAggregatedMetrics();
      this.lastMetricsEmit = now;
    }
  }

  /**
   * Emite todas las métricas agregadas acumuladas
   */
  private emitAggregatedMetrics(): void {
    const timestamp = new Date().toISOString();
    
    // Métricas de handoffs
    const handoffsCreated = this.metrics.get('event.handoff_created') || 0;
    const handoffsResolved = this.metrics.get('event.handoff_redeemed') || 0;
    const handoffsExpired = this.metrics.get('event.handoff_expired') || 0;
    const handoffsFailed = this.metrics.get('event.handoff_resolution_failed') || 0;

    // Métricas de kill-switch
    const killSwitchActivations = this.metrics.get('event.kill_switch_activated') || 0;

    // Métricas de proveedor
    const providerSuccess = this.metrics.get('event.provider_execution_success') || 0;
    const providerFailed = this.metrics.get('event.provider_execution_failed') || 0;

    // Emitir métricas agregadas
    if (handoffsCreated > 0) {
      this.recordMetric({
        name: 'handoffs_created_total',
        value: handoffsCreated,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (handoffsResolved > 0) {
      this.recordMetric({
        name: 'handoffs_resolved_total',
        value: handoffsResolved,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (handoffsExpired > 0) {
      this.recordMetric({
        name: 'handoffs_expired_total',
        value: handoffsExpired,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (handoffsFailed > 0) {
      this.recordMetric({
        name: 'handoffs_failed_total',
        value: handoffsFailed,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (killSwitchActivations > 0) {
      this.recordMetric({
        name: 'killswitch_activations_total',
        value: killSwitchActivations,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (providerSuccess > 0) {
      this.recordMetric({
        name: 'provider_executions_success_total',
        value: providerSuccess,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (providerFailed > 0) {
      this.recordMetric({
        name: 'provider_executions_failed_total',
        value: providerFailed,
        timestamp,
        tags: { period: '1m' }
      });
    }

    // Métricas de webhooks
    const webhookReceived = this.metrics.get('event.provider_webhook_received') || 0;
    const webhookInvalidSignature = this.metrics.get('event.webhook_validation_failed') || 0;
    const webhookParseError = this.metrics.get('error.parse_error') || 0;

    if (webhookReceived > 0) {
      this.recordMetric({
        name: 'webhook_received_total',
        value: webhookReceived,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (webhookInvalidSignature > 0) {
      this.recordMetric({
        name: 'webhook_invalid_signature_total',
        value: webhookInvalidSignature,
        timestamp,
        tags: { period: '1m' }
      });
    }

    if (webhookParseError > 0) {
      this.recordMetric({
        name: 'webhook_parse_error_total',
        value: webhookParseError,
        timestamp,
        tags: { period: '1m' }
      });
    }

    // Métricas de límites
    const limitExceeded = this.metrics.get('event.limit_exceeded') || 0;
    if (limitExceeded > 0) {
      this.recordMetric({
        name: 'limit_exceeded_total',
        value: limitExceeded,
        timestamp,
        tags: { period: '1m' }
      });
    }

    // Métricas de outbound (si existen)
    const outboundAttempt = this.metrics.get('event.provider_execution_started') || 0;
    if (outboundAttempt > 0) {
      this.recordMetric({
        name: 'outbound_attempt_total',
        value: outboundAttempt,
        timestamp,
        tags: { period: '1m' }
      });
    }

    // Emitir métricas de errores por categoría
    for (const [key, value] of this.metrics.entries()) {
      if (key.startsWith('error.')) {
        const errorType = key.substring(6);
        this.recordMetric({
          name: 'errors_by_category_total',
          value,
          timestamp,
          tags: { category: errorType, period: '1m' }
        });
      }
    }

    // Resetear contadores después de emitir
    this.metrics.clear();
  }
}

