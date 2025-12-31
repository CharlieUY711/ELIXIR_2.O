/**
 * NectarContext - Contexto interno de señal Nectar
 * 
 * Objeto interno que contiene:
 * - signal: NectarSignal calculado
 * - computedAt: timestamp de cálculo
 * 
 * NO contiene referencias externas.
 * NO contiene datos de usuario enriquecidos.
 * NO se persiste.
 */

import { NectarSignal } from './NectarSignal';

export interface NectarContext {
  signal: NectarSignal;
  computedAt: number; // Unix timestamp en milisegundos
}

