/**
 * AuthorizationRequest - Contrato mínimo para solicitudes de autorización
 * 
 * Campos requeridos (si falta alguno → DENY):
 * - request_id
 * - subject_id
 * - resource_id
 * - action
 * - issued_at
 * - deadline_at o deadline_ms
 * - context (opcional, con límite de tamaño estricto)
 */

export interface AuthorizationRequest {
  request_id: string;
  subject_id: string;
  resource_id: string;
  action: string;
  issued_at: number; // Unix timestamp en milisegundos
  deadline_at?: number; // Unix timestamp en milisegundos
  deadline_ms?: number; // Milisegundos desde issued_at
  context?: Record<string, unknown>; // Opcional, con límite de tamaño
}

