/**
 * Circuit Breaker Implementation
 * Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación
 * 
 * Implementa el patrón Circuit Breaker para proteger contra fallos en cascada
 */

export enum CircuitState {
  CLOSED = 'closed',    // Estado normal, permitiendo solicitudes
  OPEN = 'open',        // Estado de fallo, rechazando solicitudes
  HALF_OPEN = 'half_open' // Estado de prueba, permitiendo solicitudes limitadas
}

export interface CircuitBreakerConfig {
  failureThreshold: number;      // Número de fallos antes de abrir
  timeout: number;                // Tiempo de espera en ms
  resetTimeout: number;           // Tiempo antes de intentar cerrar (ms)
  halfOpenRequests: number;      // Número de solicitudes en half-open
  monitoringPeriod: number;      // Período de monitoreo en ms
}

export interface CircuitBreakerStats {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastSuccessTime?: number;
  totalRequests: number;
  totalFailures: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failures: number = 0;
  private successes: number = 0;
  private lastFailureTime?: number;
  private lastSuccessTime?: number;
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private halfOpenRequestCount: number = 0;
  private config: CircuitBreakerConfig;
  private resetTimer?: NodeJS.Timeout;

  constructor(config: CircuitBreakerConfig) {
    this.config = config;
  }

  /**
   * Ejecuta una función protegida por el circuit breaker
   */
  async execute<T>(
    fn: () => Promise<T>,
    fallback?: () => Promise<T> | T
  ): Promise<T> {
    this.totalRequests++;

    // Si el circuit está abierto, verificar si es tiempo de intentar cerrarlo
    if (this.state === CircuitState.OPEN) {
      if (this.shouldAttemptReset()) {
        this.transitionToHalfOpen();
      } else {
        // Ejecutar fallback si está disponible
        if (fallback) {
          return await Promise.resolve(fallback());
        }
        throw new Error('Circuit breaker is OPEN');
      }
    }

    // Si está en half-open, limitar número de solicitudes
    if (this.state === CircuitState.HALF_OPEN) {
      if (this.halfOpenRequestCount >= this.config.halfOpenRequests) {
        if (fallback) {
          return await Promise.resolve(fallback());
        }
        throw new Error('Circuit breaker is HALF_OPEN - too many requests');
      }
      this.halfOpenRequestCount++;
    }

    try {
      // Ejecutar la función con timeout
      const result = await Promise.race([
        fn(),
        this.createTimeout()
      ]);

      // Si llegamos aquí, la función fue exitosa
      this.onSuccess();
      return result as T;
    } catch (error) {
      this.onFailure();
      // Ejecutar fallback si está disponible
      if (fallback) {
        return await Promise.resolve(fallback());
      }
      throw error;
    }
  }

  /**
   * Crea una promesa que se rechaza después del timeout
   */
  private createTimeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Circuit breaker timeout'));
      }, this.config.timeout);
    });
  }

  /**
   * Maneja un éxito
   */
  private onSuccess(): void {
    this.successes++;
    this.lastSuccessTime = Date.now();

    if (this.state === CircuitState.HALF_OPEN) {
      // Si tenemos suficientes éxitos en half-open, cerrar el circuit
      if (this.successes >= this.config.halfOpenRequests) {
        this.transitionToClosed();
      }
    } else if (this.state === CircuitState.CLOSED) {
      // Resetear contador de fallos después de un éxito
      this.failures = 0;
    }
  }

  /**
   * Maneja un fallo
   */
  private onFailure(): void {
    this.failures++;
    this.totalFailures++;
    this.lastFailureTime = Date.now();

    if (this.state === CircuitState.CLOSED) {
      // Si excedemos el umbral de fallos, abrir el circuit
      if (this.failures >= this.config.failureThreshold) {
        this.transitionToOpen();
      }
    } else if (this.state === CircuitState.HALF_OPEN) {
      // Cualquier fallo en half-open vuelve a abrir el circuit
      this.transitionToOpen();
    }
  }

  /**
   * Transiciona a estado CLOSED
   */
  private transitionToClosed(): void {
    this.state = CircuitState.CLOSED;
    this.failures = 0;
    this.successes = 0;
    this.halfOpenRequestCount = 0;
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = undefined;
    }
  }

  /**
   * Transiciona a estado OPEN
   */
  private transitionToOpen(): void {
    this.state = CircuitState.OPEN;
    this.successes = 0;
    this.halfOpenRequestCount = 0;
    
    // Programar intento de reset después del timeout
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
    this.resetTimer = setTimeout(() => {
      this.transitionToHalfOpen();
    }, this.config.resetTimeout);
  }

  /**
   * Transiciona a estado HALF_OPEN
   */
  private transitionToHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.failures = 0;
    this.successes = 0;
    this.halfOpenRequestCount = 0;
  }

  /**
   * Verifica si es tiempo de intentar resetear el circuit
   */
  private shouldAttemptReset(): boolean {
    if (!this.lastFailureTime) {
      return true;
    }
    return Date.now() - this.lastFailureTime >= this.config.resetTimeout;
  }

  /**
   * Obtiene estadísticas del circuit breaker
   */
  getStats(): CircuitBreakerStats {
    return {
      state: this.state,
      failures: this.failures,
      successes: this.successes,
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
    this.transitionToClosed();
  }

  /**
   * Obtiene el estado actual
   */
  getState(): CircuitState {
    return this.state;
  }
}

/**
 * Factory para crear circuit breakers con configuración predefinida
 */
export class CircuitBreakerFactory {
  static createDatabaseBreaker(): CircuitBreaker {
    return new CircuitBreaker({
      failureThreshold: 5,
      timeout: 5000,
      resetTimeout: 30000,
      halfOpenRequests: 3,
      monitoringPeriod: 60000
    });
  }

  static createRedisBreaker(): CircuitBreaker {
    return new CircuitBreaker({
      failureThreshold: 5,
      timeout: 3000,
      resetTimeout: 20000,
      halfOpenRequests: 2,
      monitoringPeriod: 60000
    });
  }

  static createExternalServiceBreaker(): CircuitBreaker {
    return new CircuitBreaker({
      failureThreshold: 10,
      timeout: 10000,
      resetTimeout: 60000,
      halfOpenRequests: 5,
      monitoringPeriod: 120000
    });
  }
}

