/**
 * StateEvaluationRequest - Entrada del Evaluador de Estado del Usuario
 * 
 * Entradas permitidas:
 * - UserID válido (ya validado en FASE 2.1)
 * - Contexto mínimo de invocación
 */

export interface StateEvaluationRequest {
  /**
   * UserID válido del usuario
   * Debe existir y ser válido en el sistema (ya validado en FASE 2.1)
   */
  userId: string;
  
  /**
   * Contexto mínimo de invocación
   * Timestamp opcional para trazabilidad interna
   */
  timestamp?: string;
}

