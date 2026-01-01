/**
 * IUserValidator - Contrato para validación de usuarios
 * 
 * Permite validar que un UserID existe y es válido en el sistema.
 * Implementación concreta se provee externamente.
 */

export interface UserValidationResult {
  /**
   * Indica si el usuario existe y es válido
   */
  isValid: boolean;
  
  /**
   * Indica si el usuario existe (incluso si no es válido)
   */
  exists: boolean;
}

export interface IUserValidator {
  /**
   * Valida que un UserID existe y es válido
   * @param userId UserID a validar
   * @returns Resultado de la validación
   */
  validateUser(userId: string): Promise<UserValidationResult>;
}

