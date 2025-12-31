/**
 * Test: Pipeline short-circuit deny
 * 
 * Pipeline con 2 etapas:
 * - Stage1 devuelve DENY
 * - Stage2 debe NO ejecutarse (usar bandera/contador en test)
 * Resultado esperado: Decision.DENY
 */

import { describe, it, expect } from '@jest/globals';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleStage } from '../src/rules/RuleStage';
import { RuleContext } from '../src/rules/RuleContext';
import { RuleResult } from '../src/rules/RuleResult';
import { Decision } from '../src/domain/decision';
import { Clock } from '../src/runtime/clock';
import { Deadline } from '../src/runtime/deadline';
import { AuthorizationRequest } from '../src/domain/request';

describe('pipeline_short_circuit_deny', () => {
  it('debe retornar DENY inmediatamente cuando Stage1 devuelve DENY y Stage2 no debe ejecutarse', () => {
    const now = Date.now();
    const request: AuthorizationRequest = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    const clock = new Clock();
    const deadline = new Deadline(clock);
    const ctx: RuleContext = {
      request,
      clock,
      deadline,
      trace_id: 'test-trace-id'
    };

    // Bandera para verificar que Stage2 NO se ejecuta
    let stage2Executed = false;

    const stage1: RuleStage = {
      name: 'stage1',
      execute: () => {
        return { type: 'DENY' };
      }
    };

    const stage2: RuleStage = {
      name: 'stage2',
      execute: () => {
        stage2Executed = true; // Esta línea NO debe ejecutarse
        return { type: 'PASS' };
      }
    };

    const pipeline = new RulePipeline([stage1, stage2]);
    const result = pipeline.run(ctx);

    expect(result.type).toBe('DENY');
    expect(stage2Executed).toBe(false); // Stage2 NO debe haberse ejecutado
  });
});

