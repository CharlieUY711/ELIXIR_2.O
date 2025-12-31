/**
 * Test: Edge permite cuando Core retorna ALLOW
 * 
 * Verifica que el Edge permite continuar cuando el Core
 * retorna Decision.ALLOW
 */

import { describe, it, expect } from '@jest/globals';
import { EdgeRequestMapper } from '../EdgeRequestMapper';
import { EdgeClient } from '../EdgeClient';
import { EdgeDecisionHandler } from '../EdgeDecisionHandler';
import { Decision } from '../../core/src/domain/decision';
import { AuthorizationRequest } from '../../core/src/domain/request';

describe('edge_allows_on_core_allow', () => {
  it('debe permitir continuar cuando Core retorna ALLOW', async () => {
    // Mock del Core que retorna ALLOW
    const mockAuthorize = (_request: AuthorizationRequest): Decision => {
      return Decision.ALLOW;
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

    // Verificar que el Core retornó ALLOW
    expect(decision).toBe(Decision.ALLOW);

    // Procesar decisión
    const result = handler.handleDecision(decision);

    // Verificar que el Edge permite continuar
    expect(result.authorized).toBe(true);
    expect(result.message).toBeUndefined();
  });
});

