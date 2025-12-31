/**
 * EdgeDecisionHandler - Manejador de decisiones del Core
 * 
 * Responsabilidad:
 * - Si ALLOW → continuar flujo del Chat
 * - Si DENY → responder con mensaje genérico
 * 
 * Prohibido:
 * - Explicar por qué
 * - Diferenciar tipos de DENY
 * - Mostrar estados internos
 */

import { Decision } from '../core/src/domain/decision';

export interface EdgeDecisionResult {
  authorized: boolean;
  message?: string;
}

export class EdgeDecisionHandler {
  private readonly DENY_MESSAGE = 'No es posible continuar con esta solicitud';

  /**
   * Procesa la decisión del Core y retorna resultado para el Edge
   * 
   * @param decision Decision del Core (ALLOW o DENY)
   * @returns EdgeDecisionResult con authorized y mensaje opcional
   */
  handleDecision(decision: Decision): EdgeDecisionResult {
    if (decision === Decision.ALLOW) {
      return {
        authorized: true
      };
    }

    // DENY → mensaje genérico
    return {
      authorized: false,
      message: this.DENY_MESSAGE
    };
  }
}

