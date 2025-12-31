/**
 * Contrato del Handoff Resolver
 * Valida y resuelve tokens de handoff recibidos
 */

export type ResolutionErrorType = 
  | 'handoff_not_found'
  | 'handoff_expired'
  | 'handoff_already_redeemed'
  | 'storage_timeout'
  | 'storage_error'
  | 'invalid_handoff_id'
  | 'kill_switch_active';

export interface ResolutionResult {
  success: boolean;
  message: string;  // Mensaje genérico (no expone causa específica)
  error_type?: ResolutionErrorType;
}

export interface IHandoffResolver {
  /**
   * Resuelve handoff: valida, consume y ejecuta conexión
   * @param handoff_id ID del handoff a resolver
   * @returns Resultado de la resolución
   */
  resolve(handoff_id: string): Promise<ResolutionResult>;
}

