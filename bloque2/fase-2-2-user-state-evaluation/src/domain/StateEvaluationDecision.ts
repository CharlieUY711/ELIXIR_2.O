/**
 * StateEvaluationDecision - Resultado de la evaluación de estado del usuario
 * 
 * Salidas únicas permitidas:
 * - ALLOW: Usuario puede continuar (estado ACTIVE)
 * - HOLD: Usuario debe esperar (estado PENDING o FROZEN)
 * - DENY: Usuario denegado (estado DENIED o error)
 */

export enum StateEvaluationDecision {
  ALLOW = 'ALLOW',
  HOLD = 'HOLD',
  DENY = 'DENY'
}

