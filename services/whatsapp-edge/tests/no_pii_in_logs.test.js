"use strict";
/**
 * Tests: No PII en logs
 * Smoke test para verificar que no se registra PII en logs
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
(0, globals_1.describe)('No PII en logs', () => {
    (0, globals_1.it)('no debe registrar números telefónicos en eventos', () => {
        const observability = new ConsoleObservability_1.ConsoleObservability();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        observability.recordEvent({
            type: 'provider_execution_success',
            handoff_id: 'test-handoff',
            timestamp: new Date().toISOString()
        });
        const loggedData = JSON.parse(consoleSpy.mock.calls[0][0]);
        // Verificar que no hay campos que sugieran PII
        (0, globals_1.expect)(loggedData).not.toHaveProperty('phone');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('telefono');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('email');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('nombre');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('name');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('address');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('direccion');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('no debe registrar contenido de mensajes', () => {
        const observability = new ConsoleObservability_1.ConsoleObservability();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        observability.recordEvent({
            type: 'provider_execution_success',
            handoff_id: 'test-handoff',
            timestamp: new Date().toISOString()
        });
        const loggedData = JSON.parse(consoleSpy.mock.calls[0][0]);
        // Verificar que no hay campos de contenido
        (0, globals_1.expect)(loggedData).not.toHaveProperty('body');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('content');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('message');
        (0, globals_1.expect)(loggedData).not.toHaveProperty('text');
        consoleSpy.mockRestore();
    });
    (0, globals_1.it)('debe registrar solo metadatos opacos', () => {
        const observability = new ConsoleObservability_1.ConsoleObservability();
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
        observability.recordEvent({
            type: 'provider_execution_success',
            handoff_id: 'test-handoff-123',
            timestamp: new Date().toISOString()
        });
        const loggedData = JSON.parse(consoleSpy.mock.calls[0][0]);
        // Verificar que solo hay metadatos permitidos
        (0, globals_1.expect)(loggedData).toHaveProperty('handoff_id');
        (0, globals_1.expect)(loggedData).toHaveProperty('timestamp');
        (0, globals_1.expect)(loggedData).toHaveProperty('event_type');
        // handoff_id debe ser opaco (no debe parecer un número telefónico)
        const handoffId = loggedData.handoff_id;
        (0, globals_1.expect)(handoffId).not.toMatch(/^\+?\d{10,}$/); // No debe ser un número telefónico
        consoleSpy.mockRestore();
    });
});
