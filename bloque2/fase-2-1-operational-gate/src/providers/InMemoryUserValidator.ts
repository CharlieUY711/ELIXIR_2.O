/**
 * InMemoryUserValidator - Implementación en memoria del validador de usuarios
 * 
 * NOTA: Esta es una implementación de ejemplo para desarrollo.
 * En producción, debe reemplazarse por una implementación que consulte
 * el sistema real de persistencia de usuarios.
 */

import { IUserValidator, UserValidationResult } from '../contracts/IUserValidator';

export class InMemoryUserValidator implements IUserValidator {
  private validUserIds: Set<string>;

  constructor(validUserIds: string[] = []) {
    this.validUserIds = new Set(validUserIds);
  }

  async validateUser(userId: string): Promise<UserValidationResult> {
    // Validación básica: el UserID debe existir en el conjunto de usuarios válidos
    const exists = this.validUserIds.has(userId);
    const isValid = exists; // En esta implementación simple, existencia = validez

    return {
      exists,
      isValid
    };
  }

  /**
   * Agrega un UserID al conjunto de usuarios válidos (solo para testing)
   */
  addValidUser(userId: string): void {
    this.validUserIds.add(userId);
  }

  /**
   * Remueve un UserID del conjunto de usuarios válidos (solo para testing)
   */
  removeValidUser(userId: string): void {
    this.validUserIds.delete(userId);
  }
}

