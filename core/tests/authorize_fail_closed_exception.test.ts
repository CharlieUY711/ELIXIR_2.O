/**
 * Test: Fail-closed por excepción
 * 
 * Forzar error interno.
 * Resultado esperado: DENY
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('authorize_fail_closed_exception', () => {
  it('debe retornar DENY cuando ocurre una excepción interna', () => {
    // Forzar error pasando null
    const result = authorize(null);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando ocurre un error de validación', () => {
    // Request inválido (sin campos requeridos)
    const invalidRequest = {};
    const result = authorize(invalidRequest);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando ocurre cualquier error no previsto', () => {
    // Request con tipo incorrecto
    const invalidRequest = 'not an object';
    const result = authorize(invalidRequest);
    expect(result).toBe(Decision.DENY);
  });
});

