/**
 * Guardrails operativos para GO CONTROLADO
 * Límites: 100 handoffs/día, 10 simultáneos
 * Abort conditions: fail_rate >= 20% en 1 hora
 */

import { IKillSwitch } from '../contracts/KillSwitch';
import { IObservability } from '../contracts/Observability';

interface FailureEvent {
  timestamp: number;
  handoff_id: string;
}

export class OperationalLimits {
  private readonly maxHandoffsPerDay: number;
  private readonly maxConcurrentUsers: number;
  private readonly failureThresholdPercent: number;
  private readonly failureWindowMs: number;

  // Contadores diarios
  private dailyHandoffCount: number = 0;
  private lastResetDate: string = this.getCurrentDate();

  // Contadores de concurrencia
  private concurrentHandoffs: Set<string> = new Set();

  // Ventana de fallas para abort condition
  private failureEvents: FailureEvent[] = [];
  private successEvents: Array<{ timestamp: number }> = [];

  constructor(
    private killSwitch: IKillSwitch,
    private observability: IObservability
  ) {
    this.maxHandoffsPerDay = parseInt(process.env.OPERATIONAL_MAX_HANDOFFS_PER_DAY || '100', 10);
    this.maxConcurrentUsers = parseInt(process.env.OPERATIONAL_MAX_CONCURRENT_USERS || '10', 10);
    this.failureThresholdPercent = parseFloat(process.env.OPERATIONAL_FAILURE_THRESHOLD_PERCENT || '20');
    this.failureWindowMs = parseInt(process.env.OPERATIONAL_FAILURE_WINDOW_MS || '3600000', 10); // 1 hora

    // Iniciar limpieza periódica de eventos antiguos
    setInterval(() => this.cleanupOldEvents(), 60000); // Cada minuto
  }

  /**
   * Verifica si se puede procesar un handoff según límites operativos
   * @param handoff_id ID del handoff
   * @returns true si se puede procesar, false si se excede límite
   */
  async canProcessHandoff(handoff_id: string): Promise<{ allowed: boolean; reason?: string }> {
    // 1. Resetear contador diario si cambió el día
    this.resetDailyCounterIfNeeded();

    // 2. Verificar límite diario
    if (this.dailyHandoffCount >= this.maxHandoffsPerDay) {
      this.observability.recordEvent({
        type: 'limit_exceeded',
        handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'limit_exceeded',
        cause: `Límite diario excedido: ${this.dailyHandoffCount}/${this.maxHandoffsPerDay}`
      });

      this.observability.recordMetric({
        name: 'limit_exceeded_total',
        value: 1,
        timestamp: new Date().toISOString(),
        tags: { limit_type: 'daily' }
      });

      return { allowed: false, reason: 'daily_limit_exceeded' };
    }

    // 3. Verificar límite de concurrencia
    if (this.concurrentHandoffs.size >= this.maxConcurrentUsers) {
      this.observability.recordEvent({
        type: 'limit_exceeded',
        handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'limit_exceeded',
        cause: `Límite de concurrencia excedido: ${this.concurrentHandoffs.size}/${this.maxConcurrentUsers}`
      });

      this.observability.recordMetric({
        name: 'limit_exceeded_total',
        value: 1,
        timestamp: new Date().toISOString(),
        tags: { limit_type: 'concurrent' }
      });

      return { allowed: false, reason: 'concurrent_limit_exceeded' };
    }

    return { allowed: true };
  }

  /**
   * Registra inicio de procesamiento de handoff
   */
  recordHandoffStart(handoff_id: string): void {
    this.concurrentHandoffs.add(handoff_id);
    this.dailyHandoffCount++;
  }

  /**
   * Registra fin de procesamiento de handoff
   */
  recordHandoffEnd(handoff_id: string): void {
    this.concurrentHandoffs.delete(handoff_id);
  }

  /**
   * Registra éxito de handoff
   */
  recordSuccess(handoff_id: string): void {
    this.recordHandoffEnd(handoff_id);
    this.successEvents.push({ timestamp: Date.now() });
    this.checkAbortConditions();
  }

  /**
   * Registra falla de handoff
   */
  recordFailure(handoff_id: string): void {
    this.recordHandoffEnd(handoff_id);
    this.failureEvents.push({
      timestamp: Date.now(),
      handoff_id
    });
    this.checkAbortConditions();
  }

  /**
   * Verifica condiciones de abort y activa kill-switch si es necesario
   */
  private async checkAbortConditions(): Promise<void> {
    const now = Date.now();
    const windowStart = now - this.failureWindowMs;

    // Filtrar eventos dentro de la ventana
    const recentFailures = this.failureEvents.filter(e => e.timestamp >= windowStart);
    const recentSuccesses = this.successEvents.filter(e => e.timestamp >= windowStart);

    const totalEvents = recentFailures.length + recentSuccesses.length;

    if (totalEvents === 0) {
      return; // No hay eventos suficientes
    }

    const failureRate = (recentFailures.length / totalEvents) * 100;

    // Abort condition: fail_rate >= threshold
    if (failureRate >= this.failureThresholdPercent) {
      const killSwitchState = await this.killSwitch.isActive();
      
      // Solo activar si no está ya activo
      if (!killSwitchState.active) {
        await this.killSwitch.activate('DROP');
        
        this.observability.recordEvent({
          type: 'auto_killswitch_armed',
          timestamp: new Date().toISOString(),
          error_type: 'high_failure_rate',
          cause: `Tasa de fallas ${failureRate.toFixed(2)}% >= ${this.failureThresholdPercent}% en última hora`
        });

        this.observability.recordMetric({
          name: 'auto_killswitch_armed_total',
          value: 1,
          timestamp: new Date().toISOString(),
          tags: { reason: 'high_failure_rate', failure_rate: failureRate.toFixed(2) }
        });
      }
    }
  }

  /**
   * Limpia eventos antiguos fuera de la ventana
   */
  private cleanupOldEvents(): void {
    const now = Date.now();
    const windowStart = now - this.failureWindowMs;

    this.failureEvents = this.failureEvents.filter(e => e.timestamp >= windowStart);
    this.successEvents = this.successEvents.filter(e => e.timestamp >= windowStart);
  }

  /**
   * Resetea contador diario si cambió el día
   */
  private resetDailyCounterIfNeeded(): void {
    const currentDate = this.getCurrentDate();
    if (currentDate !== this.lastResetDate) {
      this.dailyHandoffCount = 0;
      this.lastResetDate = currentDate;
    }
  }

  /**
   * Obtiene fecha actual en formato YYYY-MM-DD
   */
  private getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Obtiene estadísticas actuales (para debugging/monitoreo)
   */
  getStats(): {
    dailyHandoffs: number;
    maxDailyHandoffs: number;
    concurrentHandoffs: number;
    maxConcurrentHandoffs: number;
    recentFailureRate: number;
  } {
    const now = Date.now();
    const windowStart = now - this.failureWindowMs;
    
    const recentFailures = this.failureEvents.filter(e => e.timestamp >= windowStart).length;
    const recentSuccesses = this.successEvents.filter(e => e.timestamp >= windowStart).length;
    const totalRecent = recentFailures + recentSuccesses;
    const failureRate = totalRecent > 0 ? (recentFailures / totalRecent) * 100 : 0;

    return {
      dailyHandoffs: this.dailyHandoffCount,
      maxDailyHandoffs: this.maxHandoffsPerDay,
      concurrentHandoffs: this.concurrentHandoffs.size,
      maxConcurrentHandoffs: this.maxConcurrentUsers,
      recentFailureRate: failureRate
    };
  }
}

