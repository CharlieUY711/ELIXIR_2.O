/**
 * RuleStage - Interfaz para etapas del pipeline de reglas
 * 
 * execute() NO debe lanzar; si lanza será capturado por FailClosedGuard.
 * name es SOLO para observabilidad interna (métricas); NO se expone hacia afuera.
 */

import { RuleContext } from './RuleContext';
import { RuleResult } from './RuleResult';

export interface RuleStage {
  name: string;
  execute(ctx: RuleContext): RuleResult;
}

