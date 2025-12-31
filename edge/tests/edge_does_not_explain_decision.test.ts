/**
 * Test: Edge no explica decisiones
 * 
 * Verifica que el mensaje al usuario es genérico
 * y no contiene referencias a reglas o estados
 */

import { describe, it, expect } from '@jest/globals';
import { EdgeDecisionHandler } from '../EdgeDecisionHandler';
import { Decision } from '../../core/src/domain/decision';

describe('edge_does_not_explain_decision', () => {
  it('debe usar mensaje genérico para DENY sin explicar razones', () => {
    const handler = new EdgeDecisionHandler();

    const result = handler.handleDecision(Decision.DENY);

    // Verificar que el mensaje es genérico
    expect(result.message).toBe('No es posible continuar con esta solicitud');

    // Verificar que NO contiene referencias a:
    // - Reglas
    expect(result.message).not.toMatch(/regla|rule/i);
    // - Estados
    expect(result.message).not.toMatch(/estado|state|status/i);
    // - Stress
    expect(result.message).not.toMatch(/stress|presión|pressure/i);
    // - Nectar
    expect(result.message).not.toMatch(/nectar|signal/i);
    // - Deadline
    expect(result.message).not.toMatch(/deadline|tiempo|timeout/i);
    // - Validación
    expect(result.message).not.toMatch(/valid|invalid|error/i);
  });

  it('debe retornar sin mensaje para ALLOW', () => {
    const handler = new EdgeDecisionHandler();

    const result = handler.handleDecision(Decision.ALLOW);

    // Verificar que ALLOW no tiene mensaje
    expect(result.authorized).toBe(true);
    expect(result.message).toBeUndefined();
  });

  it('debe usar el mismo mensaje genérico para todos los DENY', () => {
    const handler = new EdgeDecisionHandler();

    const result1 = handler.handleDecision(Decision.DENY);
    const result2 = handler.handleDecision(Decision.DENY);
    const result3 = handler.handleDecision(Decision.DENY);

    // Todos los DENY deben tener el mismo mensaje genérico
    expect(result1.message).toBe(result2.message);
    expect(result2.message).toBe(result3.message);
    expect(result1.message).toBe('No es posible continuar con esta solicitud');
  });
});

