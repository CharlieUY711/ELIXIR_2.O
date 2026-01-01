/**
 * Retry Handler with Exponential Backoff
 * Para ELIXIR 2.0 - Fase 7.5: Redundancia
 * 
 * Implementa reintentos con backoff exponencial y jitter
 */

export interface RetryOptions {
  maxAttempts: number;           // Número máximo de intentos
  initialDelay: number;         // Delay inicial en ms
  maxDelay: number;             // Delay máximo en ms
  multiplier: number;           // Multiplicador para backoff exponencial
  jitter: boolean;              // Habilitar jitter aleatorio
  retryableErrors?: string[];   // Errores que deben reintentarse
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  initialDelay: 1000,
  maxDelay: 30000,
  multiplier: 2,
  jitter: true,
  retryableErrors: ['ECONNREFUSED', 'ETIMEDOUT', 'ENOTFOUND', 'ECONNRESET']
};

export class RetryHandler {
  private options: RetryOptions;

  constructor(options: Partial<RetryOptions> = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Ejecuta una función con reintentos
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: Error | unknown;
    let attempt = 0;

    while (attempt < this.options.maxAttempts) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        attempt++;

        // Verificar si el error es retryable
        if (!this.isRetryable(error)) {
          throw error;
        }

        // Si es el último intento, lanzar el error
        if (attempt >= this.options.maxAttempts) {
          throw error;
        }

        // Calcular delay con backoff exponencial
        const delay = this.calculateDelay(attempt);
        
        // Esperar antes del siguiente intento
        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  /**
   * Verifica si un error es retryable
   */
  private isRetryable(error: unknown): boolean {
    if (!error) return false;

    // Si hay lista de errores retryable, verificar
    if (this.options.retryableErrors && this.options.retryableErrors.length > 0) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorCode = (error as any)?.code || '';
      
      return this.options.retryableErrors.some(
        retryableError => 
          errorMessage.includes(retryableError) || 
          errorCode === retryableError
      );
    }

    // Por defecto, todos los errores son retryable
    return true;
  }

  /**
   * Calcula el delay con backoff exponencial y jitter
   */
  private calculateDelay(attempt: number): number {
    // Backoff exponencial: initialDelay * (multiplier ^ (attempt - 1))
    let delay = this.options.initialDelay * Math.pow(this.options.multiplier, attempt - 1);

    // Aplicar jitter si está habilitado (±20%)
    if (this.options.jitter) {
      const jitterAmount = delay * 0.2;
      const jitter = (Math.random() * 2 - 1) * jitterAmount; // -20% a +20%
      delay = delay + jitter;
    }

    // Limitar al máximo
    return Math.min(delay, this.options.maxDelay);
  }

  /**
   * Sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Decorador para funciones async con retry automático
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: Partial<RetryOptions>
): T {
  const retryHandler = new RetryHandler(options);
  
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retryHandler.execute(() => fn(...args));
  }) as T;
}

