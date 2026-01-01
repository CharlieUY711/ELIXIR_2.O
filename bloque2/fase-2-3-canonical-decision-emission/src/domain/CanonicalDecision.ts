/**
 * CanonicalDecision - Decisión canónica final del BLOQUE 2
 * 
 * Salidas únicas permitidas:
 * - ALLOW: Todas las fases previas emitieron ALLOW
 * - HOLD: La FASE 2.2 emitió HOLD
 * - DENY: Alguna fase previa emitió DENY, o hubo error/inconsistencia
 */

export enum CanonicalDecision {
  ALLOW = 'ALLOW',
  HOLD = 'HOLD',
  DENY = 'DENY'
}

