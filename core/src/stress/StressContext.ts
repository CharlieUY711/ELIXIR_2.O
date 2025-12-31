/**
 * StressContext - Contexto interno de estrés
 * 
 * Objeto interno que transporta el modo de estrés detectado.
 * NO se persiste.
 * NO cruza capas.
 */

import { StressMode } from './StressMode';

export interface StressContext {
  mode: StressMode;
  detectedAt: number; // timestamp
}

