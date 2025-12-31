/**
 * Clock - Utilidad para obtener tiempo actual
 * 
 * Permite inyección de dependencias para testing.
 */

export interface IClock {
  now(): number;
}

export class Clock implements IClock {
  now(): number {
    return Date.now();
  }
}

