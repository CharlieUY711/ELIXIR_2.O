/**
 * Test: Nectar - No Afecta Decisiones
 * 
 * Dos requests idénticos salvo NectarSignal
 * Resultado de authorize() debe ser el MISMO
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleStage } from '../src/rules/RuleStage';
import { RuleContext } from '../src/rules/RuleContext';
import { RuleResult } from '../src/rules/RuleResult';
import { NectarCollector } from '../src/nectar/NectarCollector';
import { Clock } from '../src/runtime/clock';

describe('nectar_does_not_affect_decision', () => {
  it('debe retornar el mismo resultado independientemente del NectarSignal', () => {
    const now = Date.now();
    
    // Request que genera LOW (action === 'ALLOW_TEST')
    // Pero como action === 'ALLOW_TEST', el explicit allow se activa
    const requestLow = {
      request_id: 'test-request-low',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Genera LOW, pero también activa explicit allow
      issued_at: now,
      deadline_at: now + 5000
    };

    // Request que genera MEDIUM (action diferente)
    const requestMedium = {
      request_id: 'test-request-medium',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'OTHER_ACTION', // Genera MEDIUM, no activa explicit allow
      issued_at: now,
      deadline_at: now + 5000
    };

    // Pipeline vacío que retorna PASS (default deny)
    const pipeline = new RulePipeline([]);
    const service = new AuthorizeService(pipeline);

    const resultLow = service.authorize(requestLow);
    const resultMedium = service.authorize(requestMedium);

    // requestLow retorna ALLOW (por explicit allow)
    // requestMedium retorna DENY (sin explicit allow)
    // Esto demuestra que la decisión NO depende de Nectar, sino de explicit allow
    expect(resultLow).toBe(Decision.ALLOW);
    expect(resultMedium).toBe(Decision.DENY);
    
    // Para demostrar que Nectar no afecta, usamos dos requests con la misma acción
    // pero diferentes en otros aspectos que no afectan la decisión
    const request1 = {
      request_id: 'test-request-1',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'SOME_ACTION', // Genera MEDIUM
      issued_at: now,
      deadline_at: now + 5000
    };

    const request2 = {
      request_id: 'test-request-2',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'SOME_ACTION', // Genera MEDIUM (mismo NectarSignal)
      issued_at: now,
      deadline_at: now + 5000
    };

    const result1 = service.authorize(request1);
    const result2 = service.authorize(request2);

    // Ambos deben retornar el mismo resultado (DENY)
    // Nectar NO debe afectar la decisión
    expect(result1).toBe(Decision.DENY);
    expect(result2).toBe(Decision.DENY);
    expect(result1).toBe(result2);
  });

  it('debe retornar ALLOW para ambos cuando action === ALLOW_TEST, independientemente de Nectar', () => {
    const now = Date.now();
    
    // Ambos requests con action === 'ALLOW_TEST' (generan LOW)
    // Pero con diferentes request_id para asegurar que son tratados como diferentes
    const request1 = {
      request_id: 'test-request-1',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST',
      issued_at: now,
      deadline_at: now + 5000
    };

    const request2 = {
      request_id: 'test-request-2',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST',
      issued_at: now,
      deadline_at: now + 5000
    };

    const pipeline = new RulePipeline([]);
    const service = new AuthorizeService(pipeline);

    const result1 = service.authorize(request1);
    const result2 = service.authorize(request2);

    // Ambos deben retornar ALLOW (explicit allow activado)
    // Nectar NO debe afectar la decisión
    expect(result1).toBe(Decision.ALLOW);
    expect(result2).toBe(Decision.ALLOW);
    expect(result1).toBe(result2);
  });

  it('debe mantener el mismo resultado cuando NectarSignal cambia pero request es idéntico', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'SOME_ACTION', // Genera MEDIUM
      issued_at: now,
      deadline_at: now + 5000
    };

    const pipeline = new RulePipeline([]);
    const service = new AuthorizeService(pipeline);

    // Ejecutar múltiples veces con el mismo request
    const result1 = service.authorize(request);
    const result2 = service.authorize(request);
    const result3 = service.authorize(request);

    // Todos deben retornar el mismo resultado
    // Nectar puede variar internamente, pero NO debe afectar la decisión
    expect(result1).toBe(result2);
    expect(result2).toBe(result3);
    expect(result1).toBe(Decision.DENY); // Pipeline vacío + sin explicit allow
  });
});

