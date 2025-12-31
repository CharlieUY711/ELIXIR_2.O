/**
 * RuleResult - Resultado cerrado de evaluación de reglas
 * 
 * NO expone razones.
 * NO expone mensajes.
 * NO expone códigos.
 * NO expone metadata.
 */

export type RuleResult =
  | { type: 'PASS' }
  | { type: 'DENY' };

