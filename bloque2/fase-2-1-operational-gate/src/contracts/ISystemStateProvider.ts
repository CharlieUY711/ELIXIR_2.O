/**
 * ISystemStateProvider - Contrato para consulta de estado operativo global
 * 
 * Permite consultar el estado operativo global del sistema.
 * Implementación concreta se provee externamente.
 */

import { SystemState } from '../domain/SystemState';

export interface ISystemStateProvider {
  /**
   * Consulta el estado operativo global del sistema
   * @returns Estado operativo global
   */
  getSystemState(): Promise<SystemState>;
}

