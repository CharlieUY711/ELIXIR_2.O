/**
 * Contrato de Observabilidad
 * Sistema mínimo de registro y métricas agregadas
 * NO registra: contenido, PII, números telefónicos, decisiones del Core
 */

export type EventType = 
  | 'handoff_created'
  | 'handoff_redeemed'
  | 'handoff_expired'
  | 'handoff_revoked'
  | 'handoff_resolution_failed'
  | 'provider_execution_success'
  | 'provider_execution_failed'
  | 'kill_switch_activated'
  | 'kill_switch_deactivated'
  | 'provider_webhook_received'
  | 'webhook_validation_failed'
  | 'limit_exceeded'
  | 'auto_killswitch_armed';

export interface Event {
  type: EventType;
  handoff_id?: string;
  session_id?: string;
  timestamp: string;  // ISO 8601
  error_type?: string;
  cause?: string;
}

export interface Metric {
  name: string;
  value: number;
  timestamp: string;  // ISO 8601
  tags?: Record<string, string>;
}

export interface IObservability {
  /**
   * Registra evento del ciclo de vida
   * @param event Evento a registrar
   */
  recordEvent(event: Event): void;

  /**
   * Registra métrica agregada
   * @param metric Métrica a registrar
   */
  recordMetric(metric: Metric): void;
}

