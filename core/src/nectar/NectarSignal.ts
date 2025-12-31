/**
 * NectarSignal - Señal interna no decisional
 * 
 * Tipo cerrado y simple para señal técnica interna.
 * NO decide, NO autoriza, NO deniega.
 * NO se expone fuera del Core.
 */

export type NectarSignal =
  | 'LOW'
  | 'MEDIUM'
  | 'HIGH';

