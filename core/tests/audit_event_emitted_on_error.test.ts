/**
 * Test: Audit Event - Error
 * 
 * Forzar excepción
 * Verificar AUTH_ERROR
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('audit_event_emitted_on_error', () => {
  it('debe registrar AUTH_ERROR cuando ocurre una excepción', () => {
    // Request inválido que causará error de validación
    const invalidRequest = {
      // Faltan campos requeridos
    };

    const service = new AuthorizeService();
    const result = service.authorize(invalidRequest);

    // Verificar que se retornó DENY (fail-closed)
    expect(result).toBe(Decision.DENY);

    // Verificar que se registró AUTH_ERROR
    const stats = (service as any).metrics?.getStats();
    expect(stats).toBeDefined();
    expect(stats.audit_event_count).toBeDefined();
    expect(stats.audit_event_count.AUTH_ERROR).toBeGreaterThan(0);
  });
});

