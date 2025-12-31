/**
 * ExplicitAllowStage - Única regla explícita de ALLOW
 * 
 * Esta es la ÚNICA RuleStage que puede producir ALLOW.
 * Condición técnica simple y determinista.
 * 
 * Comportamiento:
 * - Si request.action === 'ALLOW_TEST' → { type: 'ALLOW' }
 * - En cualquier otro caso → { type: 'PASS' }
 */

import { RuleStage } from '../RuleStage';
import { RuleContext } from '../RuleContext';
import { RuleResult } from '../RuleResult';

export class ExplicitAllowStage implements RuleStage {
  name = 'explicit-allow';

  execute(ctx: RuleContext): RuleResult {
    // Condición técnica simple: request.action === 'ALLOW_TEST'
    if (ctx.request.action === 'ALLOW_TEST') {
      return { type: 'ALLOW' };
    }
    
    // Si no se cumple la condición, pasar
    return { type: 'PASS' };
  }
}

