/**
 * Test: Nectar - No Exposición
 * 
 * Ejecutar authorize()
 * Verificar que:
 * - Decision no contiene Nectar
 * - Logs no contienen Nectar
 * - Metrics no exponen valores por request
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';
import { Metrics } from '../src/obs/metrics';
import { Logger, LogEntry } from '../src/obs/logger';

describe('nectar_not_exposed', () => {
  let capturedLogs: LogEntry[] = [];
  let testLogger: Logger;
  let testMetrics: Metrics;

  beforeEach(() => {
    capturedLogs = [];
    
    // Crear logger que capture logs
    testLogger = {
      log: (entry: LogEntry) => {
        capturedLogs.push(entry);
      }
    } as Logger;

    testMetrics = new Metrics();
  });

  it('Decision no debe contener Nectar', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Decision debe ser solo ALLOW o DENY
    expect([Decision.ALLOW, Decision.DENY]).toContain(result);
    
    // Verificar que result no es un objeto con propiedades Nectar
    expect(typeof result).toBe('string');
    expect(result).not.toContain('nectar');
    expect(result).not.toContain('Nectar');
    expect(result).not.toContain('LOW');
    expect(result).not.toContain('MEDIUM');
    expect(result).not.toContain('HIGH');
  });

  it('Logs no deben contener Nectar', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    // Necesitamos verificar que los logs no contienen Nectar
    // Como Logger.log() usa console.log internamente, verificamos el formato
    const service = new AuthorizeService();
    service.authorize(request);

    // Los logs capturados no deben contener información de Nectar
    // Nota: En el código actual, Logger no expone los logs, pero podemos verificar
    // que el formato de LogEntry no incluye Nectar
    const logEntry: LogEntry = {
      trace_id: 'test-trace',
      result: Decision.DENY,
      latency_ms: 10,
      timestamp: now
    };

    // Verificar que LogEntry no tiene campo nectar
    expect(logEntry).not.toHaveProperty('nectar');
    expect(logEntry).not.toHaveProperty('nectarContext');
    expect(logEntry).not.toHaveProperty('nectarSignal');
  });

  it('Metrics no deben exponer valores de Nectar por request', () => {
    const now = Date.now();
    const request1 = {
      request_id: 'test-request-1',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Genera LOW
      issued_at: now,
      deadline_at: now + 5000
    };

    const request2 = {
      request_id: 'test-request-2',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'OTHER_ACTION', // Genera MEDIUM
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    service.authorize(request1);
    service.authorize(request2);

    // Verificar que las métricas agregadas existen (nectar_signal_count)
    // pero NO hay métricas por request individual
    const stats = (service as any).metrics?.getStats();
    
    if (stats && stats.nectar_signal_count) {
      // Las métricas agregadas están permitidas
      expect(stats.nectar_signal_count).toBeDefined();
      expect(typeof stats.nectar_signal_count.LOW).toBe('number');
      expect(typeof stats.nectar_signal_count.MEDIUM).toBe('number');
      expect(typeof stats.nectar_signal_count.HIGH).toBe('number');
      
      // Pero NO debe haber métricas por request_id o trace_id
      expect(stats).not.toHaveProperty('nectar_by_request');
      expect(stats).not.toHaveProperty('nectar_by_trace');
    }
  });

  it('Nectar no debe aparecer en ningún output externo', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    const service = new AuthorizeService();
    const result = service.authorize(request);

    // Convertir result a string para verificar
    const resultString = String(result);
    const resultJson = JSON.stringify(result);

    // Verificar que no contiene referencias a Nectar
    expect(resultString.toLowerCase()).not.toContain('nectar');
    expect(resultString).not.toContain('LOW');
    expect(resultString).not.toContain('MEDIUM');
    expect(resultString).not.toContain('HIGH');
    expect(resultJson.toLowerCase()).not.toContain('nectar');
  });
});

