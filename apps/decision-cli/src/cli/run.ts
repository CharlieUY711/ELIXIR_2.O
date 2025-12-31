/**
 * run - Ejecuta el comando del CLI
 * 
 * Resuelve adapter.
 * Ejecuta authorize().
 * Imprime SOLO: ALLOW o DENY
 */

import { DecisionEngine } from '../core/DecisionEngine';
import { DecisionResult } from '../core/DecisionResult';
import { ElixirAdapter } from '../adapters/elixir/ElixirAdapter';
import { InputNormalizer } from '../core/InputNormalizer';
import { ParsedArgs } from './parseArgs';

export async function run(parsedArgs: ParsedArgs): Promise<void> {
  // Resolver adapter
  let engine: DecisionEngine;
  if (parsedArgs.adapter === 'elixir') {
    engine = new ElixirAdapter();
  } else {
    throw new Error(`Unknown adapter: ${parsedArgs.adapter}`);
  }

  // Normalizar input
  const normalizer = new InputNormalizer();
  const normalizedInput = normalizer.normalize({
    action: parsedArgs.action
  });

  // Ejecutar authorize
  const result: DecisionResult = await engine.authorize(normalizedInput);

  // Imprimir SOLO: ALLOW o DENY
  console.log(result);
}

