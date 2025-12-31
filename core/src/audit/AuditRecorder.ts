/**
 * AuditRecorder - Grabador de eventos de auditoría interna
 * 
 * Emite eventos SOLO a observabilidad interna (métricas).
 * NO persiste.
 * NO loguea texto explicativo.
 */

import { AuditContext } from './AuditContext';
import { AuditEvent } from './AuditEvent';
import { Metrics } from '../obs/metrics';

export class AuditRecorder {
  private metrics: Metrics;

  constructor(metrics: Metrics) {
    this.metrics = metrics;
  }

  record(context: AuditContext): void {
    // Emitir métrica agregada para observabilidad interna
    this.metrics.incrementAuditEvent(context.event);
  }
}

