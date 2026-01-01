/**
 * InMemoryUserStateProvider - Proveedor de estado operativo en memoria
 * 
 * Implementación de ejemplo para desarrollo y testing.
 * En producción, debe reemplazarse por implementación que consulte
 * el sistema real de persistencia.
 */

import { IUserStateProvider } from '../contracts/IUserStateProvider';
import { UserOperationalState } from '../domain/UserOperationalState';

export class InMemoryUserStateProvider implements IUserStateProvider {
  private userStates: Map<string, UserOperationalState>;

  constructor(initialStates?: Map<string, UserOperationalState>) {
    this.userStates = initialStates || new Map();
  }

  /**
   * Obtiene el estado operativo actual del usuario
   * @param userId UserID del usuario
   * @returns Estado operativo del usuario o null si no existe
   */
  async getUserOperationalState(userId: string): Promise<UserOperationalState | null> {
    const state = this.userStates.get(userId);
    return state || null;
  }

  /**
   * Establece el estado operativo de un usuario (solo para testing)
   * @param userId UserID del usuario
   * @param state Estado operativo a establecer
   */
  setUserState(userId: string, state: UserOperationalState): void {
    this.userStates.set(userId, state);
  }

  /**
   * Elimina el estado de un usuario (solo para testing)
   * @param userId UserID del usuario
   */
  removeUser(userId: string): void {
    this.userStates.delete(userId);
  }
}

