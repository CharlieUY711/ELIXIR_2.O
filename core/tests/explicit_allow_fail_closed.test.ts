/**
 * Test: Explicit Allow - Fail Closed
 * 
 * ExplicitAllowStage lanza excepción
 * Resultado esperado: Decision.DENY
 */

import { describe, it, expect } from '@jest/globals';
import { Decision } from '../src/domain/decision';
import { AuthorizeService } from '../src/service/authorize';
import { ExplicitAllowStage } from '../src/rules/stages/ExplicitAllowStage';
import { RuleStage } from '../src/rules/RuleStage';

describe('explicit_allow_fail_closed', () => {
  it('debe retornar DENY cuando ExplicitAllowStage lanza excepción', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST',
      issued_at: now,
      deadline_at: now + 5000
    };

    // Crear un RuleStage que simula ExplicitAllowStage pero lanza excepción
    const throwingStage: RuleStage = {
      name: 'explicit-allow',
      execute: () => {
        throw new Error('Error en ExplicitAllowStage');
      }
    };

    // Crear servicio con stage que lanza excepción (compatible con ExplicitAllowStage)
    const service = new AuthorizeService(undefined, throwingStage as unknown as ExplicitAllowStage);
    const result = service.authorize(request);

    // FailClosedGuard debe capturar la excepción y retornar DENY
    expect(result).toBe(Decision.DENY);
  });
});

