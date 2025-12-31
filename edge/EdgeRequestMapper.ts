/**
 * EdgeRequestMapper - Traductor de input del Chat/Edge a AuthorizationRequest
 * 
 * Responsabilidad:
 * - Traducir input del Chat/Edge a AuthorizationRequest
 * - Validar presencia de campos mínimos
 * - Normalizar valores
 * 
 * Reglas:
 * - Si falta info → DENY local (no llamar al Core)
 * - No enriquecer contexto
 * - No inferir intención
 */

import { AuthorizationRequest } from '../core/src/domain/request';

export interface EdgeInput {
  session_id?: string;
  user_ref?: string;
  model_ref?: string;
  action?: string;
  [key: string]: unknown;
}

export class EdgeRequestMapper {
  /**
   * Mapea input del Edge a AuthorizationRequest válido para el Core
   * 
   * @param input Input del Chat/Edge
   * @returns AuthorizationRequest válido o null si falta información
   */
  mapToAuthorizationRequest(input: EdgeInput): AuthorizationRequest | null {
    // Validar campos mínimos requeridos
    if (!input.session_id || typeof input.session_id !== 'string') {
      return null; // DENY local - no llamar al Core
    }

    if (!input.user_ref || typeof input.user_ref !== 'string') {
      return null; // DENY local - no llamar al Core
    }

    if (!input.model_ref || typeof input.model_ref !== 'string') {
      return null; // DENY local - no llamar al Core
    }

    // Action por defecto si no se proporciona
    const action = input.action && typeof input.action === 'string' 
      ? input.action 
      : 'chat_access';

    // Timestamp actual
    const issued_at = Date.now();

    // Deadline: 30 segundos por defecto
    const deadline_ms = 30000;

    // Construir AuthorizationRequest
    const request: AuthorizationRequest = {
      request_id: `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      subject_id: input.user_ref,
      resource_id: input.model_ref,
      action: action,
      issued_at: issued_at,
      deadline_ms: deadline_ms,
      context: {
        session_id: input.session_id
      }
    };

    return request;
  }
}

