/**
 * Test: Audit Event - Decision Allow
 * 
 * Forzar Decision.ALLOW
 * Verificar AUTH_DECISION_ALLOW
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('audit_event_emitted_on_allow', () => {
  it('debe registrar AUTH_DECISION_ALLOW cuando se retorna ALLOW', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Activa ExplicitAllowStage
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Verificar que se retornó ALLOW
    expect(result).toBe(Decision.ALLOW);

    // Verificar que se registró AUTH_DECISION_ALLOW
    const stats = (service as any).metrics?.getStats();
    expect(stats).toBeDefined();
    expect(stats.audit_event_count).toBeDefined();
    expect(stats.audit_event_count.AUTH_DECISION_ALLOW).toBeGreaterThan(0);
  });
});

