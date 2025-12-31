/**
 * Metrics - Métricas internas del Elixir Core
 * 
 * Métricas mínimas:
 * - authorize_total
 * - authorize_allow_total
 * - authorize_deny_total
 * - authorize_error_total
 * - authorize_timeout_total
 * - nectar_signal_count (agregada, por señal)
 * - audit_event_count (agregada, por evento)
 */

import { NectarSignal } from '../nectar/NectarSignal';
import { StressMode } from '../stress/StressMode';
import { AuditEvent } from '../audit/AuditEvent';

export class Metrics {
  private authorizeTotal: number = 0;
  private authorizeAllowTotal: number = 0;
  private authorizeDenyTotal: number = 0;
  private authorizeErrorTotal: number = 0;
  private authorizeTimeoutTotal: number = 0;
  private nectarSignalCount: Map<NectarSignal, number> = new Map([
    ['LOW', 0],
    ['MEDIUM', 0],
    ['HIGH', 0]
  ]);
  private stressModeCount: Map<StressMode, number> = new Map([
    ['NORMAL', 0],
    ['PRESSURE', 0]
  ]);
  private auditEventCount: Map<AuditEvent, number> = new Map([
    ['AUTH_REQUEST_RECEIVED', 0],
    ['AUTH_DECISION_ALLOW', 0],
    ['AUTH_DECISION_DENY', 0],
    ['AUTH_STRESS_PRESSURE', 0],
    ['AUTH_ERROR', 0]
  ]);

  incrementAuthorizeTotal(): void {
    this.authorizeTotal++;
  }

  incrementAuthorizeAllow(): void {
    this.authorizeAllowTotal++;
  }

  incrementAuthorizeDeny(): void {
    this.authorizeDenyTotal++;
  }

  incrementAuthorizeError(): void {
    this.authorizeErrorTotal++;
  }

  incrementAuthorizeTimeout(): void {
    this.authorizeTimeoutTotal++;
  }

  incrementNectarSignal(signal: NectarSignal): void {
    const current = this.nectarSignalCount.get(signal) || 0;
    this.nectarSignalCount.set(signal, current + 1);
  }

  incrementStressMode(mode: StressMode): void {
    const current = this.stressModeCount.get(mode) || 0;
    this.stressModeCount.set(mode, current + 1);
  }

  incrementAuditEvent(event: AuditEvent): void {
    const current = this.auditEventCount.get(event) || 0;
    this.auditEventCount.set(event, current + 1);
  }

  getStats(): {
    authorize_total: number;
    authorize_allow_total: number;
    authorize_deny_total: number;
    authorize_error_total: number;
    authorize_timeout_total: number;
    nectar_signal_count: { [key in NectarSignal]: number };
    stress_mode_count: { [key in StressMode]: number };
    audit_event_count: { [key in AuditEvent]: number };
  } {
    return {
      authorize_total: this.authorizeTotal,
      authorize_allow_total: this.authorizeAllowTotal,
      authorize_deny_total: this.authorizeDenyTotal,
      authorize_error_total: this.authorizeErrorTotal,
      authorize_timeout_total: this.authorizeTimeoutTotal,
      nectar_signal_count: {
        LOW: this.nectarSignalCount.get('LOW') || 0,
        MEDIUM: this.nectarSignalCount.get('MEDIUM') || 0,
        HIGH: this.nectarSignalCount.get('HIGH') || 0
      },
      stress_mode_count: {
        NORMAL: this.stressModeCount.get('NORMAL') || 0,
        PRESSURE: this.stressModeCount.get('PRESSURE') || 0
      },
      audit_event_count: {
        AUTH_REQUEST_RECEIVED: this.auditEventCount.get('AUTH_REQUEST_RECEIVED') || 0,
        AUTH_DECISION_ALLOW: this.auditEventCount.get('AUTH_DECISION_ALLOW') || 0,
        AUTH_DECISION_DENY: this.auditEventCount.get('AUTH_DECISION_DENY') || 0,
        AUTH_STRESS_PRESSURE: this.auditEventCount.get('AUTH_STRESS_PRESSURE') || 0,
        AUTH_ERROR: this.auditEventCount.get('AUTH_ERROR') || 0
      }
    };
  }
}

