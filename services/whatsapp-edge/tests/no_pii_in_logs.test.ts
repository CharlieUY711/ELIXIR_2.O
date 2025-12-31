/**
 * Tests: No PII en logs
 * Smoke test para verificar que no se registra PII en logs
 */

import { describe, it, expect } from '@jest/globals';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';

describe('No PII en logs', () => {
  it('no debe registrar números telefónicos en eventos', () => {
    const observability = new ConsoleObservability();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    observability.recordEvent({
      type: 'provider_execution_success',
      handoff_id: 'test-handoff',
      timestamp: new Date().toISOString()
    });

    const loggedData = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    
    // Verificar que no hay campos que sugieran PII
    expect(loggedData).not.toHaveProperty('phone');
    expect(loggedData).not.toHaveProperty('telefono');
    expect(loggedData).not.toHaveProperty('email');
    expect(loggedData).not.toHaveProperty('nombre');
    expect(loggedData).not.toHaveProperty('name');
    expect(loggedData).not.toHaveProperty('address');
    expect(loggedData).not.toHaveProperty('direccion');

    consoleSpy.mockRestore();
  });

  it('no debe registrar contenido de mensajes', () => {
    const observability = new ConsoleObservability();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    observability.recordEvent({
      type: 'provider_execution_success',
      handoff_id: 'test-handoff',
      timestamp: new Date().toISOString()
    });

    const loggedData = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    
    // Verificar que no hay campos de contenido
    expect(loggedData).not.toHaveProperty('body');
    expect(loggedData).not.toHaveProperty('content');
    expect(loggedData).not.toHaveProperty('message');
    expect(loggedData).not.toHaveProperty('text');

    consoleSpy.mockRestore();
  });

  it('debe registrar solo metadatos opacos', () => {
    const observability = new ConsoleObservability();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    observability.recordEvent({
      type: 'provider_execution_success',
      handoff_id: 'test-handoff-123',
      timestamp: new Date().toISOString()
    });

    const loggedData = JSON.parse(consoleSpy.mock.calls[0][0] as string);
    
    // Verificar que solo hay metadatos permitidos
    expect(loggedData).toHaveProperty('handoff_id');
    expect(loggedData).toHaveProperty('timestamp');
    expect(loggedData).toHaveProperty('event_type');
    
    // handoff_id debe ser opaco (no debe parecer un número telefónico)
    const handoffId = loggedData.handoff_id as string;
    expect(handoffId).not.toMatch(/^\+?\d{10,}$/); // No debe ser un número telefónico

    consoleSpy.mockRestore();
  });
});

