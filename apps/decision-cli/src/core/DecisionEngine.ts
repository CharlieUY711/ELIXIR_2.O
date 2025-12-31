/**
 * DecisionEngine - Interfaz genérica para motores de decisión
 */

import { DecisionResult } from './DecisionResult';

export interface DecisionEngine {
  authorize(input: unknown): Promise<DecisionResult>;
}

