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
 */

import { NectarSignal } from '../nectar/NectarSignal';

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

  getStats(): {
    authorize_total: number;
    authorize_allow_total: number;
    authorize_deny_total: number;
    authorize_error_total: number;
    authorize_timeout_total: number;
    nectar_signal_count: { [key in NectarSignal]: number };
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
      }
    };
  }
}

