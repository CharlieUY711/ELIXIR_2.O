/**
 * SystemState - Estado operativo global del sistema
 * 
 * Representa el estado operativo global que determina
 * si el sistema puede continuar operando.
 */

export enum SystemOperationalState {
  /**
   * Sistema operativo y disponible
   */
  OPERATIONAL = 'OPERATIONAL',
  
  /**
   * Sistema globalmente apagado
   * No permite continuar a FASE 2.2
   */
  SHUTDOWN = 'SHUTDOWN'
}

export interface SystemState {
  /**
   * Estado operativo global del sistema
   */
  operationalState: SystemOperationalState;
}

