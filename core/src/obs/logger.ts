/**
 * Logger - Logging seguro interno
 * 
 * Logs permitidos:
 * - trace_id
 * - result (ALLOW | DENY)
 * - latency_ms
 * 
 * Logs prohibidos:
 * - reglas
 * - estados internos
 * - contexto sensible
 * - Nectar
 * - explicaciones
 */

import { Decision } from '../domain/decision';

export interface LogEntry {
  trace_id: string;
  result: Decision;
  latency_ms: number;
  timestamp: number;
}

export class Logger {
  log(entry: LogEntry): void {
    // En producción, esto se enviaría a un sistema de logging
    // Por ahora, solo console.log seguro (sin información sensible)
    console.log(JSON.stringify({
      trace_id: entry.trace_id,
      result: entry.result,
      latency_ms: entry.latency_ms,
      timestamp: entry.timestamp
    }));
  }
}

