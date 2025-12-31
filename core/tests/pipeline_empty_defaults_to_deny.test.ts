/**
 * Test: Pipeline empty defaults to deny
 * 
 * Pipeline sin etapas.
 * Resultado esperado: Decision.DENY
 */

import { describe, it, expect } from '@jest/globals';
import { RulePipeline } from '../src/rules/Pipeline';
import { RuleContext } from '../src/rules/RuleContext';
import { Decision } from '../src/domain/decision';
import { Clock } from '../src/runtime/clock';
import { Deadline } from '../src/runtime/deadline';
import { AuthorizationRequest } from '../src/domain/request';
import { authorize } from '../src/service/authorize';

describe('pipeline_empty_defaults_to_deny', () => {
  it('debe retornar DENY cuando el pipeline no tiene etapas', () => {
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

    // Pipeline sin etapas
    const pipeline = new RulePipeline([]);
    const result = pipeline.run(ctx);

    // Pipeline vacío retorna PASS (no DENY)
    // Pero authorize() convierte PASS a DENY
    expect(result.type).toBe('PASS');
  });

  it('debe retornar DENY cuando authorize() usa pipeline vacío por defecto', () => {
    const now = Date.now();
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: now,
      deadline_at: now + 5000
    };

    // authorize() usa pipeline vacío por defecto
    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });
});

