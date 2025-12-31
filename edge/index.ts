/**
 * Edge - Adaptador tonto para consumir Elixir Core
 * 
 * Entrypoint único del Edge que expone la funcionalidad
 * de integración con el Core.
 */

import { EdgeRequestMapper, EdgeInput } from './EdgeRequestMapper';
import { EdgeClient } from './EdgeClient';
import { EdgeDecisionHandler, EdgeDecisionResult } from './EdgeDecisionHandler';
import { Decision } from '../core/src/domain/decision';

export { EdgeRequestMapper } from './EdgeRequestMapper';
export { EdgeClient } from './EdgeClient';
export { EdgeDecisionHandler } from './EdgeDecisionHandler';

/**
 * Función de conveniencia para autorizar una solicitud del Edge
 * 
 * @param input Input del Chat/Edge
 * @returns EdgeDecisionResult con authorized y mensaje opcional
 */
export async function authorizeEdgeRequest(input: EdgeInput): Promise<EdgeDecisionResult> {
  const mapper = new EdgeRequestMapper();
  const client = new EdgeClient();
  const handler = new EdgeDecisionHandler();

  // Mapear input a AuthorizationRequest
  const authRequest = mapper.mapToAuthorizationRequest(input);
  
  // Si falta información → DENY local
  if (!authRequest) {
    return handler.handleDecision(Decision.DENY);
  }

  // Llamar al Core
  const decision = await client.authorize(authRequest);

  // Procesar decisión
  return handler.handleDecision(decision);
}

