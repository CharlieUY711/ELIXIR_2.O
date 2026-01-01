/**
 * InMemorySystemStateProvider - Implementación en memoria del proveedor de estado del sistema
 * 
 * NOTA: Esta es una implementación de ejemplo para desarrollo.
 * En producción, debe reemplazarse por una implementación que consulte
 * el estado real del sistema.
 */

import { ISystemStateProvider } from '../contracts/ISystemStateProvider';
import { SystemState, SystemOperationalState } from '../domain/SystemState';

export class InMemorySystemStateProvider implements ISystemStateProvider {
  private systemState: SystemState;

  constructor(initialState: SystemOperationalState = SystemOperationalState.OPERATIONAL) {
    this.systemState = {
      operationalState: initialState
    };
  }

  async getSystemState(): Promise<SystemState> {
    return { ...this.systemState };
  }

  /**
   * Establece el estado operativo del sistema (solo para testing)
   */
  setSystemState(state: SystemOperationalState): void {
    this.systemState = {
      operationalState: state
    };
  }
}

