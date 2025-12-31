/**
 * StressMode - Modo interno de estrés del Elixir Core
 * 
 * Tipo cerrado que representa el estado de estrés del sistema.
 * NO se expone fuera del Core.
 * NO se persiste.
 */

export type StressMode =
  | 'NORMAL'
  | 'PRESSURE';

