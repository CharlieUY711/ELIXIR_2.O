/**
 * Test: Edge retorna DENY cuando Core tiene error o timeout
 * 
 * Verifica que el Edge trata errores y timeouts como DENY
 */

import { describe, it, expect } from '@jest/globals';
import { EdgeRequestMapper } from '../EdgeRequestMapper';
import { EdgeClient } from '../EdgeClient';
import { EdgeDecisionHandler } from '../EdgeDecisionHandler';
import { Decision } from '../../core/src/domain/decision';
import { AuthorizationRequest } from '../../core/src/domain/request';

describe('edge_denies_on_core_error', () => {
  it('debe retornar DENY cuando Core lanza error', async () => {
    // Mock del Core que lanza error
    const mockAuthorize = (_request: AuthorizationRequest): Decision => {
      throw new Error('Core error');
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

    // Llamar al Core (mock que lanza error)
    const decision = await client.authorize(authRequest!);

    // Verificar que el error se trata como DENY
    expect(decision).toBe(Decision.DENY);

    // Procesar decisión
    const result = handler.handleDecision(decision);

    // Verificar que el Edge bloquea
    expect(result.authorized).toBe(false);
    expect(result.message).toBe('No es posible continuar con esta solicitud');
  });

  it('debe retornar DENY cuando Core tiene timeout', async () => {
    // Mock del Core que nunca resuelve (timeout)
    const mockAuthorize = (_request: AuthorizationRequest): Promise<Decision> => {
      return new Promise<Decision>(() => {
        // Promesa que nunca resuelve
      });
    };
    
    // Crear cliente con timeout corto (100ms)
    const client = new EdgeClient(100, mockAuthorize as any);
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

    // Llamar al Core (mock que nunca resuelve)
    const decision = await client.authorize(authRequest!);

    // Verificar que el timeout se trata como DENY
    expect(decision).toBe(Decision.DENY);

    // Procesar decisión
    const result = handler.handleDecision(decision);

    // Verificar que el Edge bloquea
    expect(result.authorized).toBe(false);
    expect(result.message).toBe('No es posible continuar con esta solicitud');
  });
});

