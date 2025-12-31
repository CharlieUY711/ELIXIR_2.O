"use strict";
/**
 * Tests: Idempotencia
 * Verifica que operaciones repetidas no tienen efectos adicionales
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const InMemoryTempStore_1 = require("../src/storage/InMemoryTempStore");
const NoopSender_1 = require("../src/sender/NoopSender");
const InMemoryKillSwitch_1 = require("../src/killswitch/InMemoryKillSwitch");
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
const HandoffResolverImpl_1 = require("../src/resolver/HandoffResolverImpl");
(0, globals_1.describe)('Idempotencia', () => {
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
    (0, globals_1.it)('debe ser idempotente resolver handoff ya REDEEMED', async () => {
        // Crear handoff y resolverlo primero
        const handoff = {
            handoff_id: 'test-handoff-idempotent',
            session_id: 'session-1',
            user_ref: 'user-1',
            model_ref: 'model-1',
            status: 'CREATED',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        await tempStore.create(handoff);
        // Resolver primero para marcarlo como REDEEMED
        await resolver.resolve('test-handoff-idempotent');
        // Múltiples intentos de resolución deben retornar mismo resultado
        const result1 = await resolver.resolve('test-handoff-idempotent');
        const result2 = await resolver.resolve('test-handoff-idempotent');
        const result3 = await resolver.resolve('test-handoff-idempotent');
        (0, globals_1.expect)(result1.success).toBe(false);
        (0, globals_1.expect)(result2.success).toBe(false);
        (0, globals_1.expect)(result3.success).toBe(false);
        (0, globals_1.expect)(result1.message).toBe(result2.message);
        (0, globals_1.expect)(result2.message).toBe(result3.message);
    });
});
