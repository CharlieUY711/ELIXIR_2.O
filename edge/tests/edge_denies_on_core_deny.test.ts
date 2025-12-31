/**
 * Test: Edge bloquea cuando Core retorna DENY
 * 
 * Verifica que el Edge bloquea el flujo cuando el Core
 * retorna Decision.DENY
 */

import { describe, it, expect } from '@jest/globals';
import { EdgeRequestMapper } from '../EdgeRequestMapper';
import { EdgeClient } from '../EdgeClient';
import { EdgeDecisionHandler } from '../EdgeDecisionHandler';
import { Decision } from '../../core/src/domain/decision';
import { AuthorizationRequest } from '../../core/src/domain/request';

describe('edge_denies_on_core_deny', () => {
  it('debe bloquear flujo cuando Core retorna DENY', async () => {
    // Mock del Core que retorna DENY
    const mockAuthorize = (_request: AuthorizationRequest): Decision => {
      return Decision.DENY;
    };
    
    // Crear cliente con mock
    const client = new EdgeClient(5000, mockAuthorize);
    const mapper = new EdgeRequestMapper();
    const handler = new EdgeDecisionHandler();

    const input = {
      session_id: 'test-session-123',
      user_ref: 'user-456',
      model_ref: 'model-789'
    };

    // Mapear input
    const authRequest = mapper.mapToAuthorizationRequest(input);
    expect(authRequest).not.toBeNull();

    // Llamar al Core (mock)
    const decision = await client.authorize(authRequest!);

    // Verificar que el Core retornó DENY
    expect(decision).toBe(Decision.DENY);

    // Procesar decisión
    const result = handler.handleDecision(decision);

    // Verificar que el Edge bloquea
    expect(result.authorized).toBe(false);
    expect(result.message).toBe('No es posible continuar con esta solicitud');
  });
});

