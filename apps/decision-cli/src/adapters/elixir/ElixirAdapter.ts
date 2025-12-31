/**
 * ElixirAdapter - Adapter para Elixir Core
 * 
 * Implementa DecisionEngine.
 * Importa authorize() desde Elixir Core real.
 * Mapea input normalizado a AuthorizationRequest.
 * Devuelve SOLO 'ALLOW' o 'DENY'.
 * try/catch obligatorio: error => 'DENY'
 */

import { DecisionEngine } from '../../core/DecisionEngine';
import { DecisionResult } from '../../core/DecisionResult';
import { mapToAuthorizationRequest } from './mapper';
import { NormalizedInput } from '../../core/InputNormalizer';
import * as path from 'path';

export class ElixirAdapter implements DecisionEngine {
  async authorize(input: unknown): Promise<DecisionResult> {
    try {
      // Importar core compilado en tiempo de ejecución
      // Calcular ruta a la raíz del proyecto desde apps/decision-cli
      let projectRoot = process.cwd();
      if (projectRoot.includes('apps' + path.sep + 'decision-cli')) {
        // Desde apps/decision-cli subir 2 niveles a la raíz
        projectRoot = path.resolve(projectRoot, '../..');
      }
      const corePath = path.join(projectRoot, 'core', 'dist', 'service', 'authorize');
      const { authorize } = require(corePath);
      const decisionPath = path.join(projectRoot, 'core', 'dist', 'domain', 'decision');
      const { Decision } = require(decisionPath);
      
      const normalizedInput = input as NormalizedInput;
      const authorizationRequest = mapToAuthorizationRequest(normalizedInput);
      // authorize() es síncrono, pero mantenemos async para cumplir con la interfaz
      const decision = authorize(authorizationRequest);
      
      return decision === Decision.ALLOW ? 'ALLOW' : 'DENY';
    } catch (error) {
      return 'DENY';
    }
  }
}

