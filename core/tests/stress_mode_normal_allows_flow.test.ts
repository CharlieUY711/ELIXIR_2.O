/**
 * Test: Stress Mode - Normal Allows Flow
 * 
 * StressMode = NORMAL
 * ExplicitAllowStage cumple condición (request.action === 'ALLOW_TEST')
 * Resultado esperado: Decision.ALLOW
 * 
 * En modo normal, el flujo debe funcionar normalmente
 * y permitir ALLOW cuando ExplicitAllowStage lo indica.
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('stress_mode_normal_allows_flow', () => {
  it('debe retornar ALLOW cuando StressMode es NORMAL y ExplicitAllowStage cumple condición', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Genera LOW signal → NORMAL → permite flujo normal
      issued_at: now,
      deadline_at: now + 5000
    };

    const result = authorize(request);

    // En modo NORMAL, el flujo normal debe funcionar
    // ALLOW_TEST activa ExplicitAllowStage → ALLOW
    expect(result).toBe(Decision.ALLOW);
  });
});

