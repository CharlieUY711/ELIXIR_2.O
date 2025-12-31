/**
 * Test: Nectar Signal - Computación
 * 
 * Request válido
 * NectarCollector computa un NectarSignal
 * Verificar que existe en contexto interno
 */

import { describe, it, expect } from '@jest/globals';
import { AuthorizeService } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleStage } from '../src/rules/RuleStage';
import { RuleContext } from '../src/rules/RuleContext';
import { RuleResult } from '../src/rules/RuleResult';

describe('nectar_signal_is_computed', () => {
  it('debe computar NectarSignal y almacenarlo en contexto interno', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Esto debería generar LOW
      issued_at: now,
      deadline_at: now + 5000
    };

    // Crear un RuleStage que capture el contexto para verificar NectarContext
    let capturedContext: RuleContext | null = null;
    const capturingStage: RuleStage = {
      name: 'capture-context',
      execute: (ctx: RuleContext): RuleResult => {
        capturedContext = { ...ctx };
        return { type: 'PASS' };
      }
    };

    const pipeline = new RulePipeline([capturingStage]);
    const service = new AuthorizeService(pipeline);
    const result = service.authorize(request);

    // Verificar que se ejecutó (resultado puede ser DENY o ALLOW, no importa)
    expect(result).toBeDefined();
    expect([Decision.ALLOW, Decision.DENY]).toContain(result);

    // Verificar que NectarContext existe en el contexto interno
    expect(capturedContext).not.toBeNull();
    expect(capturedContext).toBeTruthy();
    const ctx = capturedContext!;
    expect(ctx.nectarContext).toBeDefined();
    expect(ctx.nectarContext?.signal).toBeDefined();
    expect(['LOW', 'MEDIUM', 'HIGH']).toContain(ctx.nectarContext?.signal);
    expect(ctx.nectarContext?.computedAt).toBeGreaterThan(0);
  });

  it('debe computar MEDIUM para acciones diferentes a ALLOW_TEST', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'OTHER_ACTION', // Esto debería generar MEDIUM
      issued_at: now,
      deadline_at: now + 5000
    };

    let capturedContext: RuleContext | null = null;
    const capturingStage: RuleStage = {
      name: 'capture-context',
      execute: (ctx: RuleContext): RuleResult => {
        capturedContext = ctx;
        return { type: 'PASS' };
      }
    };

    const pipeline = new RulePipeline([capturingStage]);
    const service = new AuthorizeService(pipeline);
    service.authorize(request);

    expect(capturedContext).toBeTruthy();
    expect(capturedContext!.nectarContext?.signal).toBe('MEDIUM');
  });

  it('debe computar LOW para action === ALLOW_TEST', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'ALLOW_TEST', // Esto debería generar LOW
      issued_at: now,
      deadline_at: now + 5000
    };

    let capturedContext: RuleContext | null = null;
    const capturingStage: RuleStage = {
      name: 'capture-context',
      execute: (ctx: RuleContext): RuleResult => {
        capturedContext = ctx;
        return { type: 'PASS' };
      }
    };

    const pipeline = new RulePipeline([capturingStage]);
    const service = new AuthorizeService(pipeline);
    service.authorize(request);

    expect(capturedContext).toBeTruthy();
    expect(capturedContext!.nectarContext?.signal).toBe('LOW');
  });
});

