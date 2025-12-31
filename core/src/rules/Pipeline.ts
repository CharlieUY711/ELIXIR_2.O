/**
 * RulePipeline - Ejecutor secuencial deny-only
 * 
 * Comportamiento obligatorio:
 * - Ejecutar etapas en orden.
 * - Si una etapa devuelve {type:'DENY'} → retornar {type:'DENY'} inmediatamente.
 * - Si una etapa devuelve PASS → continuar.
 * - Si stages está vacío → retornar {type:'PASS'}.
 * - Si se ejecutan todas sin DENY → retornar {type:'PASS'}.
 * - NO existe ningún retorno ALLOW.
 * 
 * IMPORTANTE: PASS NO autoriza. authorize() convierte PASS a DENY.
 */

import { RuleContext } from './RuleContext';
import { RuleStage } from './RuleStage';
import { RuleResult } from './RuleResult';

export class RulePipeline {
  private stages: RuleStage[];

  constructor(stages: RuleStage[] = []) {
    this.stages = stages;
  }

  run(ctx: RuleContext): RuleResult {
    // Si stages está vacío → retornar PASS
    if (this.stages.length === 0) {
      return { type: 'PASS' };
    }

    // Ejecutar etapas en orden
    for (const stage of this.stages) {
      try {
        const result: RuleResult = stage.execute(ctx);
        
        if (result.type === 'DENY') {
          // Short-circuit: retornar DENY inmediatamente
          return { type: 'DENY' };
        }
        // Si es PASS, continuar con la siguiente etapa
      } catch (error) {
        // Si una etapa lanza, será capturado por FailClosedGuard en authorize()
        // pero aquí también manejamos defensivamente
        return { type: 'DENY' };
      }
    }

    // Si se ejecutan todas sin DENY → retornar PASS
    return { type: 'PASS' };
  }
}

