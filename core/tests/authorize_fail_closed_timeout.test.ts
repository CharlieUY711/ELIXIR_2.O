/**
 * Test: Fail-closed por timeout
 * 
 * Deadline vencido.
 * Resultado esperado: DENY
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('authorize_fail_closed_timeout', () => {
  it('debe retornar DENY cuando el deadline está vencido (deadline_at)', () => {
    const now = Date.now();
    const expiredRequest = {
      request_id: 'test-request-1',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now - 10000, // Hace 10 segundos
      deadline_at: now - 1000 // Vencido hace 1 segundo
    };

    const result = authorize(expiredRequest);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando el deadline está vencido (deadline_ms)', () => {
    const now = Date.now();
    const expiredRequest = {
      request_id: 'test-request-2',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now - 10000, // Hace 10 segundos
      deadline_ms: 1000 // Solo 1 segundo de validez (ya vencido)
    };

    const result = authorize(expiredRequest);
    expect(result).toBe(Decision.DENY);
  });
});

