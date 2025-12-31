/**
 * NectarCollector - Colector interno de señal Nectar
 * 
 * Calcula NectarSignal de forma DETERMINISTA y SIMPLE.
 * 
 * Condición permitida (basada en request.action):
 * - action === 'ALLOW_TEST' → LOW
 * - cualquier otro → MEDIUM
 * 
 * NO inventa lógica compleja.
 * Esto es una señal técnica, no de negocio.
 */

import { AuthorizationRequest } from '../domain/request';
import { NectarSignal } from './NectarSignal';
import { NectarContext } from './NectarContext';
import { IClock } from '../runtime/clock';

export class NectarCollector {
  private clock: IClock;

  constructor(clock: IClock) {
    this.clock = clock;
  }

  collect(request: AuthorizationRequest): NectarContext {
    const signal: NectarSignal = this.computeSignal(request);
    const computedAt = this.clock.now();

    return {
      signal,
      computedAt
    };
  }

  private computeSignal(request: AuthorizationRequest): NectarSignal {
    // Lógica determinista simple basada en action
    if (request.action === 'ALLOW_TEST') {
      return 'LOW';
    }
    
    if (request.action === 'HIGH_TEST') {
      return 'HIGH';
    }
    
    // Cualquier otro caso → MEDIUM
    return 'MEDIUM';
  }
}

