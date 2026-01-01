/**
 * CanonicalDecisionRequest - Entrada del Emisor de Decisión Canónica
 * 
 * Entradas permitidas:
 * - Resultado de FASE 2.1 (GateDecision)
 * - Resultado de FASE 2.2 (StateEvaluationDecision)
 * - Contexto mínimo de invocación
 */

import { GateDecision } from '../../fase-2-1-operational-gate/src/domain/GateDecision';
import { StateEvaluationDecision } from '../../fase-2-2-user-state-evaluation/src/domain/StateEvaluationDecision';

export interface CanonicalDecisionRequest {
  /**
   * Resultado de la FASE 2.1 - Gate de Existencia Operativa
   * Debe ser ALLOW o DENY
   */
  gateDecision: GateDecision;
  
  /**
   * Resultado de la FASE 2.2 - Evaluación de Estado del Usuario
   * Debe ser ALLOW, HOLD o DENY
   */
  stateEvaluationDecision: StateEvaluationDecision;
  
  /**
   * Contexto mínimo de invocación
   * Timestamp opcional para trazabilidad interna
   */
  timestamp?: string;
}

