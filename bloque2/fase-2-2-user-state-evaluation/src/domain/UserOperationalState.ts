/**
 * UserOperationalState - Estados operativos permitidos del usuario
 * 
 * Estados únicos permitidos:
 * - PENDING: Usuario en proceso de activación
 * - ACTIVE: Usuario activo y operativo
 * - FROZEN: Usuario congelado temporalmente
 * - DENIED: Usuario denegado
 */

export enum UserOperationalState {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  FROZEN = 'FROZEN',
  DENIED = 'DENIED'
}

