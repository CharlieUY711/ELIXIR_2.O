/**
 * EdgeClient - Cliente para consumir el Elixir Core
 * 
 * Responsabilidad:
 * - Llamar a authorize() del Core
 * - Timeout corto
 * - Sin retries
 * 
 * Si error:
 * - Tratar como DENY
 */

import { authorize, Decision } from '../core/src/service/authorize';
import { AuthorizationRequest } from '../core/src/domain/request';

const DEFAULT_TIMEOUT_MS = 5000; // 5 segundos

export type AuthorizeFunction = (request: AuthorizationRequest) => Decision;

export class EdgeClient {
  private timeoutMs: number;
  private authorizeFn: AuthorizeFunction;

  constructor(timeoutMs: number = DEFAULT_TIMEOUT_MS, authorizeFn?: AuthorizeFunction) {
    this.timeoutMs = timeoutMs;
    this.authorizeFn = authorizeFn || authorize;
  }

  /**
   * Llama al Core para obtener una decisión
   * 
   * @param request AuthorizationRequest válido
   * @returns Decision.ALLOW o Decision.DENY (si error, retorna DENY)
   */
  async authorize(request: AuthorizationRequest): Promise<Decision> {
    try {
      // Crear promesa con timeout
      const decisionPromise = Promise.resolve(this.authorizeFn(request));
      const timeoutPromise = new Promise<Decision>((resolve) => {
        setTimeout(() => {
          resolve(Decision.DENY); // Timeout → DENY
        }, this.timeoutMs);
      });

      // Race entre la decisión y el timeout
      const decision = await Promise.race([decisionPromise, timeoutPromise]);
      return decision;
    } catch (error) {
      // Cualquier error → DENY
      return Decision.DENY;
    }
  }
}

