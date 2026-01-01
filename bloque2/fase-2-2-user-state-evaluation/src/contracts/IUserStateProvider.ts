/**
 * IUserStateProvider - Contrato para obtener el estado operativo del usuario
 * 
 * Permite consultar el estado operativo actual de un usuario en el sistema.
 * Implementación concreta se provee externamente.
 */

import { UserOperationalState } from '../domain/UserOperationalState';

export interface IUserStateProvider {
  /**
   * Obtiene el estado operativo actual del usuario
   * @param userId UserID del usuario
   * @returns Estado operativo del usuario o null si no se puede determinar
   */
  getUserOperationalState(userId: string): Promise<UserOperationalState | null>;
}

