/**
 * AuditEvent - Tipo cerrado de eventos de auditoría interna
 * 
 * Eventos mínimos para observabilidad interna.
 * NO contiene razones, payloads ni referencias a reglas.
 */

export type AuditEvent =
  | 'AUTH_REQUEST_RECEIVED'
  | 'AUTH_DECISION_ALLOW'
  | 'AUTH_DECISION_DENY'
  | 'AUTH_STRESS_PRESSURE'
  | 'AUTH_ERROR';

