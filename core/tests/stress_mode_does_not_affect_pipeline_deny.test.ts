/**
 * Test: Stress Mode - Does Not Affect Pipeline Deny
 * 
 * Pipeline devuelve DENY
 * StressMode = NORMAL
 * Resultado esperado: Decision.DENY
 * 
 * El StressMode no debe afectar las denegaciones del pipeline.
 * Si el pipeline niega, el resultado debe ser DENY independientemente
 * del modo de estrés.
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleStage } from '../src/rules/RuleStage';
import { RuleContext } from '../src/rules/RuleContext';
import { RuleResult } from '../src/rules/RuleResult';

describe('stress_mode_does_not_affect_pipeline_deny', () => {
  it('debe retornar DENY cuando pipeline niega incluso en modo NORMAL', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Normalmente generaría ALLOW
      issued_at: now,
      deadline_at: now + 5000
    };

    // Crear un pipeline que siempre niega
    const denyStage: RuleStage = {
      name: 'always-deny',
      execute: (ctx: RuleContext): RuleResult => {
        return { type: 'DENY' };
      }
    };

    const pipeline = new RulePipeline([denyStage]);
    const service = new AuthorizeService(pipeline);
    const result = service.authorize(request);

    // El pipeline niega → DENY, independientemente del modo de estrés
    expect(result).toBe(Decision.DENY);
  });
});

