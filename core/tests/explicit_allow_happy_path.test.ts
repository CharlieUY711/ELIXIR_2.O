/**
 * Test: Explicit Allow - Happy Path
 * 
 * Request válido
 * Pipeline sin DENY
 * Condición de ExplicitAllowStage cumplida (request.action === 'ALLOW_TEST')
 * Resultado esperado: Decision.ALLOW
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('explicit_allow_happy_path', () => {
  it('debe retornar ALLOW cuando request.action === ALLOW_TEST y pipeline no niega', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Condición cumplida
      issued_at: now,
      deadline_at: now + 5000
    };

    const result = authorize(request);

    expect(result).toBe(Decision.ALLOW);
  });
});

