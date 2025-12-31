/**
 * InputNormalizer - Normaliza y valida input crudo del CLI
 * 
 * Valida campos mínimos requeridos.
 * No interpreta reglas.
 * Devuelve objeto normalizado.
 */

export interface NormalizedInput {
  action: string;
  [key: string]: unknown;
}

export class InputNormalizer {
  normalize(input: unknown): NormalizedInput {
    if (!input || typeof input !== 'object') {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;

    // Validar que action existe
    if (!obj.action || typeof obj.action !== 'string') {
      throw new Error('Missing or invalid action field');
    }

    return {
      action: obj.action,
      ...obj
    };
  }
}

