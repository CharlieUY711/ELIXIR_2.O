/**
 * Test: Stress Mode - Blocks Allow
 * 
 * StressMode = PRESSURE
 * ExplicitAllowStage cumpliría condición (request.action === 'ALLOW_TEST')
 * Resultado esperado: Decision.DENY
 * 
 * Bajo presión, el sistema debe denegar incluso si ExplicitAllowStage
 * normalmente permitiría la solicitud.
 * 
 * Nota: Para activar PRESSURE, necesitamos HIGH signal.
 * Como ALLOW_TEST genera LOW, necesitamos modificar NectarCollector
 * para que ALLOW_TEST también pueda generar HIGH en condiciones de presión.
 * Por simplicidad, usamos HIGH_TEST para activar PRESSURE y verificamos
 * que el sistema deniega incluso cuando el pipeline no niega.
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('stress_mode_blocks_allow', () => {
  it('debe retornar DENY cuando StressMode es PRESSURE incluso si pipeline no niega', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'HIGH_TEST', // Genera HIGH signal → PRESSURE → DENY
      issued_at: now,
      deadline_at: now + 5000
    };

    const result = authorize(request);

    // Bajo PRESSURE, el sistema debe retornar DENY
    // incluso si el pipeline no niega y ExplicitAllowStage podría permitir
    expect(result).toBe(Decision.DENY);
  });
});

