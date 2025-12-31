/**
 * Contrato del Sender (Adaptador de Proveedor)
 * Traduce acciones del sistema a llamadas al proveedor de WhatsApp
 */

export interface SendRequest {
  handoff_id: string;
  user_ref: string;
  model_ref: string;
}

export type SendErrorType = 
  | 'provider_timeout' 
  | 'provider_error' 
  | 'provider_unavailable' 
  | 'invalid_credentials' 
  | 'invalid_user_ref' 
  | 'invalid_model_ref';

export interface SendResult {
  success: boolean;
  timestamp: string;  // ISO 8601
  error_type?: SendErrorType;
}

export interface ISender {
  /**
   * Ejecuta conexión usuario-modelo en WhatsApp
   * @param request Datos del handoff
   * @returns Resultado de la ejecución
   */
  send(request: SendRequest): Promise<SendResult>;
}

