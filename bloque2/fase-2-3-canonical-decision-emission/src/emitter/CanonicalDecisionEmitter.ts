/**
 * CanonicalDecisionEmitter - Emisor de Decisión Canónica
 * FASE 2.3 - BLOQUE 2
 * 
 * Emite una única decisión canónica como salida final del BLOQUE 2,
 * sin reinterpretar ni enriquecer resultados previos.
 * 
 * Reglas obligatorias:
 * - Si alguna fase previa emitió DENY → DENY final
 * - Si FASE 2.2 emitió HOLD → HOLD final
 * - Solo si todas las fases previas emitieron ALLOW → ALLOW final
 * 
 * Comportamiento por defecto:
 * - Error, inconsistencia o ambigüedad → DENY
 */

import { CanonicalDecisionRequest } from '../domain/CanonicalDecisionRequest';
import { CanonicalDecision } from '../domain/CanonicalDecision';
import { GateDecision } from '../../fase-2-1-operational-gate/src/domain/GateDecision';
import { StateEvaluationDecision } from '../../fase-2-2-user-state-evaluation/src/domain/StateEvaluationDecision';

export class CanonicalDecisionEmitter {
  /**
   * Emite una decisión canónica basada en los resultados de las fases previas
   * 
   * Reglas de decisión:
   * 1. Si alguna fase previa emitió DENY → DENY final
   * 2. Si FASE 2.2 emitió HOLD → HOLD final
   * 3. Solo si todas las fases previas emitieron ALLOW → ALLOW final
   * 
   * Comportamiento por defecto:
   * - Error, inconsistencia o ambigüedad → DENY
   * 
   * Invariantes de seguridad:
   * - Fail-closed por defecto: cualquier error resulta en DENY
   * - No reinterpretación: los resultados se toman como están
   * - Prioridad de DENY: DENY tiene prioridad absoluta
   * - Prioridad de HOLD: HOLD tiene prioridad sobre ALLOW
   * - ALLOW solo con consenso: requiere ALLOW de ambas fases
   * - Sin side-effects: función pura, no modifica estado ni genera efectos secundarios
   * - Determinismo: mismos inputs producen mismo output
   * - Idempotencia: múltiples invocaciones con mismos inputs producen mismo resultado
   * 
   * @param request Solicitud con resultados de FASE 2.1 y FASE 2.2
   * @returns Decisión canónica: ALLOW, HOLD o DENY
   */
  emit(request: CanonicalDecisionRequest): CanonicalDecision {
    try {
      // Validar que los resultados estén presentes
      if (!request.gateDecision || !request.stateEvaluationDecision) {
        // Resultados faltantes → DENY (fail-closed)
        return CanonicalDecision.DENY;
      }

      // Validar que los resultados sean valores válidos
      const isValidGateDecision = 
        request.gateDecision === GateDecision.ALLOW || 
        request.gateDecision === GateDecision.DENY;
      
      const isValidStateEvaluationDecision = 
        request.stateEvaluationDecision === StateEvaluationDecision.ALLOW ||
        request.stateEvaluationDecision === StateEvaluationDecision.HOLD ||
        request.stateEvaluationDecision === StateEvaluationDecision.DENY;

      if (!isValidGateDecision || !isValidStateEvaluationDecision) {
        // Resultados inválidos → DENY (fail-closed)
        return CanonicalDecision.DENY;
      }

      // Regla 1: Si alguna fase previa emitió DENY → DENY final
      if (request.gateDecision === GateDecision.DENY) {
        return CanonicalDecision.DENY;
      }

      if (request.stateEvaluationDecision === StateEvaluationDecision.DENY) {
        return CanonicalDecision.DENY;
      }

      // Regla 2: Si FASE 2.2 emitió HOLD → HOLD final
      if (request.stateEvaluationDecision === StateEvaluationDecision.HOLD) {
        return CanonicalDecision.HOLD;
      }

      // Regla 3: Solo si todas las fases previas emitieron ALLOW → ALLOW final
      if (
        request.gateDecision === GateDecision.ALLOW &&
        request.stateEvaluationDecision === StateEvaluationDecision.ALLOW
      ) {
        return CanonicalDecision.ALLOW;
      }

      // Cualquier otra combinación no prevista → DENY (fail-closed)
      return CanonicalDecision.DENY;
    } catch (error) {
      // Cualquier error → DENY (fail-closed)
      return CanonicalDecision.DENY;
    }
  }
}

