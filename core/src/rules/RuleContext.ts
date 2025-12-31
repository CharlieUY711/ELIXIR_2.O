/**
 * RuleContext - Contexto mínimo para evaluación de reglas
 * 
 * Contiene SOLO elementos ya presentes en Core.
 * NO contiene datos externos.
 * NO contiene historial.
 * NO contiene contenido sensible adicional.
 * 
 * NectarContext es opcional y solo para transporte interno.
 * NO se usa para decidir, autorizar ni denegar.
 */

import { AuthorizationRequest } from '../domain/request';
import { IClock } from '../runtime/clock';
import { Deadline } from '../runtime/deadline';
import { NectarContext } from '../nectar/NectarContext';

export interface RuleContext {
  request: AuthorizationRequest;
  clock: IClock;
  deadline: Deadline;
  trace_id: string; // Solo interno
  nectarContext?: NectarContext; // Opcional, solo transporte interno
}

