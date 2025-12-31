/**
 * Test: Explicit Allow - Never Overrides Deny
 * 
 * Pipeline devuelve DENY
 * ExplicitAllowStage cumpliría condición (request.action === 'ALLOW_TEST')
 * Resultado esperado: Decision.DENY
 * 
 * IMPORTANTE: DENY del pipeline tiene prioridad absoluta sobre ALLOW explícito
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleStage } from '../src/rules/RuleStage';

describe('explicit_allow_never_overrides_deny', () => {
  it('debe retornar DENY cuando pipeline niega aunque ExplicitAllowStage cumpliría condición', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Condición cumplida para ExplicitAllowStage
      issued_at: now,
      deadline_at: now + 5000
    };

    // Crear un pipeline que siempre niega
    const denyStage: RuleStage = {
      name: 'always-deny',
      execute: () => {
        return { type: 'DENY' };
      }
    };

    const pipeline = new RulePipeline([denyStage]);
    
    // Crear servicio con pipeline personalizado que niega
    const service = new AuthorizeService(pipeline);
    const result = service.authorize(request);

    // Aunque action === 'ALLOW_TEST' (condición cumplida),
    // el pipeline niega primero, por lo que el resultado debe ser DENY
    expect(result).toBe(Decision.DENY);
  });
});

