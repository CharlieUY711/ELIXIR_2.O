/**
 * UserStateEvaluator - Evaluador de Estado del Usuario
 * FASE 2.2 - BLOQUE 2
 * 
 * Evalúa el estado operativo del usuario y traduce a decisión canónica.
 * 
 * Reglas obligatorias de decisión:
 * - ACTIVE  → ALLOW
 * - PENDING → HOLD
 * - FROZEN → HOLD
 * - DENIED  → DENY
 * 
 * Comportamiento por defecto:
 * - Estado desconocido, error o inconsistencia → DENY
 */

import { StateEvaluationRequest } from '../domain/StateEvaluationRequest';
import { StateEvaluationDecision } from '../domain/StateEvaluationDecision';
import { UserOperationalState } from '../domain/UserOperationalState';
import { IUserStateProvider } from '../contracts/IUserStateProvider';

export class UserStateEvaluator {
  private userStateProvider: IUserStateProvider;

  constructor(userStateProvider: IUserStateProvider) {
    this.userStateProvider = userStateProvider;
  }

  /**
   * Evalúa el estado operativo del usuario y traduce a decisión canónica
   * 
   * Reglas de decisión:
   * - ACTIVE  → ALLOW
   * - PENDING → HOLD
   * - FROZEN → HOLD
   * - DENIED  → DENY
   * 
   * Comportamiento por defecto:
   * - Estado desconocido, error o inconsistencia → DENY
   * 
   * @param request Solicitud de evaluación de estado
   * @returns Decisión canónica: ALLOW, HOLD o DENY
   */
  async evaluate(request: StateEvaluationRequest): Promise<StateEvaluationDecision> {
    try {
      // Obtener estado operativo del usuario
      const userState = await this.userStateProvider.getUserOperationalState(request.userId);

      // Si no se puede determinar el estado → DENY (fail-closed)
      if (userState === null) {
        return StateEvaluationDecision.DENY;
      }

      // Aplicar reglas de decisión según estado operativo
      switch (userState) {
        case UserOperationalState.ACTIVE:
          return StateEvaluationDecision.ALLOW;

        case UserOperationalState.PENDING:
          return StateEvaluationDecision.HOLD;

        case UserOperationalState.FROZEN:
          return StateEvaluationDecision.HOLD;

        case UserOperationalState.DENIED:
          return StateEvaluationDecision.DENY;

        default:
          // Estado desconocido o no documentado → DENY (fail-closed)
          return StateEvaluationDecision.DENY;
      }
    } catch (error) {
      // Cualquier error → DENY (fail-closed)
      return StateEvaluationDecision.DENY;
    }
  }
}

