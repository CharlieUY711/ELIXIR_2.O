/**
 * Test: Audit Event - Stress Pressure
 * 
 * StressMode = PRESSURE
 * Verificar AUTH_STRESS_PRESSURE
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('audit_event_emitted_on_stress', () => {
  it('debe registrar AUTH_STRESS_PRESSURE cuando StressMode es PRESSURE', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'HIGH_TEST', // Genera HIGH signal → PRESSURE
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Verificar que se retornó DENY (por presión)
    expect(result).toBe(Decision.DENY);

    // Verificar que se registró AUTH_STRESS_PRESSURE
    const stats = (service as any).metrics?.getStats();
    expect(stats).toBeDefined();
    expect(stats.audit_event_count).toBeDefined();
    expect(stats.audit_event_count.AUTH_STRESS_PRESSURE).toBeGreaterThan(0);
  });
});

