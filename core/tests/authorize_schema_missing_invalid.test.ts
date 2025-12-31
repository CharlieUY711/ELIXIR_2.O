/**
 * Test: Schema missing / invalid
 * 
 * Campo requerido faltante o inválido.
 * Resultado esperado: DENY
 */

import { describe, it, expect } from '@jest/globals';
import { authorize } from '../src/service/authorize';
import { Decision } from '../src/domain/decision';

describe('authorize_schema_missing_invalid', () => {
  it('debe retornar DENY cuando falta request_id', () => {
    const request = {
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando falta subject_id', () => {
    const request = {
      request_id: 'test-request',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando falta resource_id', () => {
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando falta action', () => {
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando falta issued_at', () => {
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando falta deadline_at y deadline_ms', () => {
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now()
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando request_id es inválido (no string)', () => {
    const request = {
      request_id: 123,
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando issued_at es inválido (no number)', () => {
    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: 'invalid',
      deadline_ms: 5000
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });

  it('debe retornar DENY cuando context es demasiado grande', () => {
    const largeContext: Record<string, string> = {};
    // Crear un context que exceda el límite de 1024 bytes
    for (let i = 0; i < 1000; i++) {
      largeContext[`key${i}`] = 'x'.repeat(10);
    }

    const request = {
      request_id: 'test-request',
      subject_id: 'test-subject',
      resource_id: 'test-resource',
      action: 'test-action',
      issued_at: Date.now(),
      deadline_ms: 5000,
      context: largeContext
    };

    const result = authorize(request);
    expect(result).toBe(Decision.DENY);
  });
});

