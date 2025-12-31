"use strict";
/**
 * Tests: Fail-Closed
 * Verifica que cualquier falla resulta en rechazo de handoff
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const InMemoryTempStore_1 = require("../src/storage/InMemoryTempStore");
const NoopSender_1 = require("../src/sender/NoopSender");
const InMemoryKillSwitch_1 = require("../src/killswitch/InMemoryKillSwitch");
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
const HandoffResolverImpl_1 = require("../src/resolver/HandoffResolverImpl");
(0, globals_1.describe)('Fail-Closed', () => {
    let tempStore;
    let sender;
    let killSwitch;
    let observability;
    let resolver;
    (0, globals_1.beforeEach)(() => {
        tempStore = new InMemoryTempStore_1.InMemoryTempStore();
        sender = new NoopSender_1.NoopSender();
        killSwitch = new InMemoryKillSwitch_1.InMemoryKillSwitch();
        observability = new ConsoleObservability_1.ConsoleObservability();
        resolver = new HandoffResolverImpl_1.HandoffResolverImpl(tempStore, sender, killSwitch, observability);
        tempStore.clear();
    });
    (0, globals_1.it)('debe rechazar handoff no encontrado', async () => {
        const result = await resolver.resolve('handoff-inexistente');
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.message).toBe('Enlace inválido');
    });
    (0, globals_1.it)('debe rechazar handoff con formato inválido', async () => {
        const result = await resolver.resolve('invalid-format');
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.message).toBe('Enlace inválido');
        (0, globals_1.expect)(result.error_type).toBe('invalid_handoff_id');
    });
});
