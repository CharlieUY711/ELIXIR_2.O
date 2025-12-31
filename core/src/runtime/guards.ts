/**
 * FailClosedGuard - Garantiza fail-closed absoluto
 * 
 * Captura TODA excepción.
 * Captura timeout.
 * Siempre retorna DENY en caso de error.
 * 
 * NO retries.
 * NO soft-fail.
 * NO fallback permisivo.
 */

import { Decision } from '../domain/decision';

export class FailClosedGuard {
  static execute(fn: () => Decision, onError: () => Decision): Decision {
    try {
      const result = fn();
      // Si no hay excepción, retornar el resultado
      return result;
    } catch (error) {
      // Cualquier error → DENY
      return onError();
    }
  }

  static executeAsync<T>(
    fn: () => Promise<T>,
    onError: () => Decision,
    timeoutMs?: number
  ): Promise<Decision> {
    return new Promise((resolve) => {
      try {
        const promise = fn();
        
        if (timeoutMs !== undefined) {
          const timeout = setTimeout(() => {
            resolve(onError());
          }, timeoutMs);
          
          promise
            .then(() => {
              clearTimeout(timeout);
              resolve(Decision.DENY); // Default deny en este PR
            })
            .catch(() => {
              clearTimeout(timeout);
              resolve(onError());
            });
        } else {
          promise
            .then(() => {
              resolve(Decision.DENY); // Default deny en este PR
            })
            .catch(() => {
              resolve(onError());
            });
        }
      } catch (error) {
        resolve(onError());
      }
    });
  }
}

