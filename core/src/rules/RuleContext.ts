/**
 * RuleContext - Contexto mínimo para evaluación de reglas
 * 
 * Contiene SOLO elementos ya presentes en Core.
 * NO contiene datos externos.
 * NO contiene historial.
 * NO contiene contenido sensible adicional.
 * NO contiene Nectar.
 */

import { AuthorizationRequest } from '../domain/request';
import { IClock } from '../runtime/clock';
import { Deadline } from '../runtime/deadline';

export interface RuleContext {
  request: AuthorizationRequest;
  clock: IClock;
  deadline: Deadline;
  trace_id: string; // Solo interno
}

