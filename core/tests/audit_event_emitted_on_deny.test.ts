/**
 * Test: Audit Event - Decision Deny
 * 
 * Forzar Decision.DENY
 * Verificar AUTH_DECISION_DENY
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('audit_event_emitted_on_deny', () => {
  it('debe registrar AUTH_DECISION_DENY cuando se retorna DENY', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action', // No activa ExplicitAllowStage → DENY
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Verificar que se retornó DENY
    expect(result).toBe(Decision.DENY);

    // Verificar que se registró AUTH_DECISION_DENY
    const stats = (service as any).metrics?.getStats();
    expect(stats).toBeDefined();
    expect(stats.audit_event_count).toBeDefined();
    expect(stats.audit_event_count.AUTH_DECISION_DENY).toBeGreaterThan(0);
  });
});

