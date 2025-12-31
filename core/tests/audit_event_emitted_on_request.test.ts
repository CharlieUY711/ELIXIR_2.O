/**
 * Test: Audit Event - Request Received
 * 
 * Ejecutar authorize()
 * Verificar que se registra AUTH_REQUEST_RECEIVED
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('audit_event_emitted_on_request', () => {
  it('debe registrar AUTH_REQUEST_RECEIVED cuando se ejecuta authorize()', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Verificar que se ejecutó
    expect([Decision.ALLOW, Decision.DENY]).toContain(result);

    // Verificar que se registró AUTH_REQUEST_RECEIVED
    const stats = (service as any).metrics?.getStats();
    expect(stats).toBeDefined();
    expect(stats.audit_event_count).toBeDefined();
    expect(stats.audit_event_count.AUTH_REQUEST_RECEIVED).toBeGreaterThan(0);
  });
});

