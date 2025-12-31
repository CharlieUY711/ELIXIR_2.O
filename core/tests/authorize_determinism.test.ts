/**
 * Test: Determinismo
 * 
 * Mismo input → mismo resultado
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('authorize_determinism', () => {
  it('debe retornar el mismo resultado para el mismo input válido', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request-determinism',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    const result1 = authorize(request);
    const result2 = authorize(request);
    const result3 = authorize(request);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe(Decision.DENY); // En este PR, default es DENY
  });

  it('debe retornar el mismo resultado para el mismo input inválido', () => {
    const invalidRequest = {
      request_id: 'test-request',
      // Falta subject_id
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result1 = authorize(invalidRequest);
    const result2 = authorize(invalidRequest);
    const result3 = authorize(invalidRequest);

    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe(Decision.DENY);
  });
});

