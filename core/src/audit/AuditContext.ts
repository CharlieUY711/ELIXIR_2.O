/**
 * AuditContext - Contexto interno de auditoría
 * 
 * Objeto mínimo para eventos de auditoría.
 * NO contiene datos de request, PII ni decisiones detalladas.
 */

import { AuditEvent } from './AuditEvent';

export interface AuditContext {
  event: AuditEvent;
  traceId: string;
  timestamp: number;
}

