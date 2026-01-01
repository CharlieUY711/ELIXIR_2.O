/**
 * Circuit Breaker Pattern Implementation
 * Para ELIXIR 2.0 - Fase 7.5: Redundancia
 * 
 * Implementa el patrón Circuit Breaker para proteger contra fallos en cascada
 */

export enum CircuitState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN'
}

export interface CircuitBreakerOptions {
  failureThreshold: number;      // Número de fallos antes de abrir
  successThreshold: number;      // Número de éxitos para cerrar desde half-open
  timeout: number;               // Tiempo en ms antes de intentar half-open
  resetTimeout: number;          // Tiempo en ms antes de resetear contadores
  monitoringPeriod: number;      // Período de monitoreo en ms
}

export interface CircuitBreakerMetrics {
  failures: number;
  successes: number;
  state: CircuitState;
  lastFailureTime: number | null;
  lastSuccessTime: number | null;
  totalRequests: number;
  totalFailures: number;
}

const DEFAULT_OPTIONS: CircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 5000,
  resetTimeout: 60000,
  monitoringPeriod: 60000
};

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime: number | null = null;
  private lastSuccessTime: number | null = null;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private nextAttempt: number = 0;
  private options: CircuitBreakerOptions;

  constructor(
    private name: string,
    options: Partial<CircuitBreakerOptions> = {}
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Ejecuta una función protegida por el circuit breaker
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Verificar si debemos intentar half-open
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        throw new CircuitBreakerOpenError(
          `Circuit breaker ${this.name} is OPEN. Next attempt at ${new Date(this.nextAttempt).toISOString()}`
        );
      }
      this.state = CircuitState.HALF_OPEN;
      this.successes = 0;
      this.failures = 0;
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  /**
   * Maneja un éxito
   */
  private onSuccess(): void {
    this.lastSuccessTime = Date.now();
    this.successes++;

    if (this.state === CircuitState.HALF_OPEN) {
      if (this.successes >= this.options.successThreshold) {
        this.close();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Resetear contador de fallos después del período de monitoreo
      if (this.lastFailureTime && 
          Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.failures = 0;
      }
    }
  }

  /**
   * Maneja un fallo
   */
  private onFailure(): void {
    this.lastFailureTime = Date.now();
    this.failures++;
    this.totalFailures++;

    if (this.state === CircuitState.HALF_OPEN) {
      this.open();
    } else if (this.state === CircuitState.CLOSED) {
      if (this.failures >= this.options.failureThreshold) {
        this.open();
      }
    }
  }

  /**
   * Abre el circuit breaker
   */
  private open(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.options.timeout;
    this.failures = 0;
    this.successes = 0;
  }

  /**
   * Cierra el circuit breaker
   */
  private close(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.nextAttempt = 0;
  }

  /**
   * Obtiene el estado actual
   */
  getState(): CircuitState {
    return this.state;
  }

  /**
   * Obtiene métricas
   */
  getMetrics(): CircuitBreakerMetrics {
    return {
      failures: this.failures,
      successes: this.successes,
      state: this.state,
      lastFailureTime: this.lastFailureTime,
      lastSuccessTime: this.lastSuccessTime,
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures
    };
  }

  /**
   * Resetea el circuit breaker manualmente
   */
  reset(): void {
    this.close();
    this.totalRequests = 0;
    this.totalFailures = 0;
    this.lastFailureTime = null;
    this.lastSuccessTime = null;
  }
}

export class CircuitBreakerOpenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CircuitBreakerOpenError';
  }
}

