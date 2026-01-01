/**
 * GateRequest - Entrada del Gate de Existencia Operativa
 * 
 * Entradas permitidas:
 * - UserID válido
 * - Flags operativos globales (opcional, se consultan internamente)
 * - Contexto mínimo de invocación
 */

export interface GateRequest {
  /**
   * UserID válido del usuario
   * Debe existir y ser válido en el sistema
   */
  userId: string;
  
  /**
   * Contexto mínimo de invocación
   * Timestamp opcional para trazabilidad interna
   */
  timestamp?: string;
}

