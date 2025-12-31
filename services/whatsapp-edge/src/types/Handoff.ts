/**
 * Tipos y estructuras de datos para handoffs
 * Solo metadatos permitidos - NO contenido, NO PII, NO números telefónicos
 */

export type HandoffStatus = 'CREATED' | 'REDEEMED' | 'EXPIRED' | 'REVOKED';

export interface Handoff {
  handoff_id: string;        // UUID v4 o equivalente, único, no predecible
  session_id: string;        // Referencia a sesión del Chat
  user_ref: string;          // Referencia abstracta al usuario (no número telefónico)
  model_ref: string;         // Referencia abstracta al modelo (no número telefónico)
  status: HandoffStatus;
  created_at: string;         // ISO 8601 timestamp
  expires_at: string;        // ISO 8601 timestamp, TTL: ~5 minutos
  redeemed_at?: string;      // ISO 8601 timestamp (solo si status es REDEEMED)
  revoked_at?: string;       // ISO 8601 timestamp (solo si status es REVOKED)
}

export interface CreateHandoffRequest {
  session_id: string;
  user_ref: string;
  model_ref: string;
}

export interface CreateHandoffResponse {
  handoff_id: string;
  handoff_url: string;
}

