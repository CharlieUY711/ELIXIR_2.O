/**
 * Health Checker
 * Para ELIXIR 2.0 - Fase 7.5: Redundancia
 * 
 * Verifica la salud de dependencias y servicios
 */

export interface HealthCheckResult {
  healthy: boolean;
  timestamp: number;
  checks: Record<string, HealthStatus>;
}

export interface HealthStatus {
  healthy: boolean;
  message?: string;
  latency?: number;
  error?: string;
}

export type HealthCheckFunction = () => Promise<HealthStatus>;

export class HealthChecker {
  private checks: Map<string, HealthCheckFunction> = new Map();

  /**
   * Registra un health check
   */
  register(name: string, check: HealthCheckFunction): void {
    this.checks.set(name, check);
  }

  /**
   * Ejecuta todos los health checks
   */
  async checkAll(): Promise<HealthCheckResult> {
    const results: Record<string, HealthStatus> = {};
    let allHealthy = true;

    const checkPromises = Array.from(this.checks.entries()).map(
      async ([name, checkFn]) => {
        const startTime = Date.now();
        try {
          const status = await Promise.race([
            checkFn(),
            this.timeout(5000) // Timeout de 5 segundos
          ]);
          const latency = Date.now() - startTime;
          results[name] = { ...status, latency };
          if (!status.healthy) {
            allHealthy = false;
          }
        } catch (error) {
          const latency = Date.now() - startTime;
          results[name] = {
            healthy: false,
            latency,
            error: error instanceof Error ? error.message : String(error)
          };
          allHealthy = false;
        }
      }
    );

    await Promise.all(checkPromises);

    return {
      healthy: allHealthy,
      timestamp: Date.now(),
      checks: results
    };
  }

  /**
   * Ejecuta un health check específico
   */
  async check(name: string): Promise<HealthStatus> {
    const checkFn = this.checks.get(name);
    if (!checkFn) {
      return {
        healthy: false,
        error: `Health check '${name}' not found`
      };
    }

    const startTime = Date.now();
    try {
      const status = await Promise.race([
        checkFn(),
        this.timeout(5000)
      ]);
      const latency = Date.now() - startTime;
      return { ...status, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return {
        healthy: false,
        latency,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Timeout helper
   */
  private timeout(ms: number): Promise<HealthStatus> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Health check timeout after ${ms}ms`));
      }, ms);
    });
  }

  /**
   * Verifica si un servicio está listo (ready)
   */
  async isReady(): Promise<boolean> {
    const result = await this.checkAll();
    return result.healthy;
  }

  /**
   * Verifica si un servicio está vivo (liveness)
   */
  async isAlive(): Promise<boolean> {
    // Liveness check más simple - solo verifica que el proceso esté corriendo
    return true;
  }
}

