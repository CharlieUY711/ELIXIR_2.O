/**
 * RuleResult - Resultado cerrado de evaluación de reglas
 * 
 * NO expone razones.
 * NO expone mensajes.
 * NO expone códigos.
 * NO expone metadata.
 * 
 * IMPORTANTE: ALLOW solo puede ser emitido por ExplicitAllowStage.
 */

export type RuleResult =
  | { type: 'PASS' }
  | { type: 'DENY' }
  | { type: 'ALLOW' };

