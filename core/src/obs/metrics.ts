/**
 * Metrics - Métricas internas del Elixir Core
 * 
 * Métricas mínimas:
 * - authorize_total
 * - authorize_allow_total
 * - authorize_deny_total
 * - authorize_error_total
 * - authorize_timeout_total
 */

export class Metrics {
  private authorizeTotal: number = 0;
  private authorizeAllowTotal: number = 0;
  private authorizeDenyTotal: number = 0;
  private authorizeErrorTotal: number = 0;
  private authorizeTimeoutTotal: number = 0;

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

  getStats(): {
    authorize_total: number;
    authorize_allow_total: number;
    authorize_deny_total: number;
    authorize_error_total: number;
    authorize_timeout_total: number;
  } {
    return {
      authorize_total: this.authorizeTotal,
      authorize_allow_total: this.authorizeAllowTotal,
      authorize_deny_total: this.authorizeDenyTotal,
      authorize_error_total: this.authorizeErrorTotal,
      authorize_timeout_total: this.authorizeTimeoutTotal
    };
  }
}

