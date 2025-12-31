/**
 * StressDetector - Detector determinista de estrés
 * 
 * Detecta condiciones de presión del sistema de forma determinista y simple.
 * 
 * Condición actual:
 * - Si NectarSignal === 'HIGH' → PRESSURE
 * - En cualquier otro caso → NORMAL
 * 
 * NO usa ML.
 * NO usa heurísticas opacas.
 * NO depende de servicios externos.
 */

import { StressMode } from './StressMode';
import { StressContext } from './StressContext';
import { NectarContext } from '../nectar/NectarContext';
import { IClock } from '../runtime/clock';

export class StressDetector {
  private clock: IClock;

  constructor(clock: IClock) {
    this.clock = clock;
  }

  detect(nectarContext: NectarContext | undefined): StressContext {
    // Si no hay NectarContext, modo NORMAL
    if (!nectarContext) {
      return {
        mode: 'NORMAL',
        detectedAt: this.clock.now()
      };
    }

    // Detección determinista: HIGH signal → PRESSURE
    const mode: StressMode = nectarContext.signal === 'HIGH' ? 'PRESSURE' : 'NORMAL';

    return {
      mode,
      detectedAt: this.clock.now()
    };
  }
}

