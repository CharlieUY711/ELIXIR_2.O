/**
 * Test: Explicit Allow - Not Triggered Defaults to Deny
 * 
 * Request válido
 * Pipeline sin DENY
 * Condición NO cumplida (request.action !== 'ALLOW_TEST')
 * Resultado esperado: Decision.DENY
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('explicit_allow_not_triggered_defaults_to_deny', () => {
  it('debe retornar DENY cuando condición no se cumple aunque pipeline no niega', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'other-action', // Condición NO cumplida
      issued_at: now,
      deadline_at: now + 5000
    };

    const result = authorize(request);

    expect(result).toBe(Decision.DENY);
  });
});

