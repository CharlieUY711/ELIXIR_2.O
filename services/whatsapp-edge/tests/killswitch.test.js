"use strict";
/**
 * Tests: Kill-Switch
 * Verifica que kill-switch detiene procesamiento inmediatamente
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const InMemoryTempStore_1 = require("../src/storage/InMemoryTempStore");
const NoopSender_1 = require("../src/sender/NoopSender");
const PersistentKillSwitch_1 = require("../src/killswitch/PersistentKillSwitch");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
const HandoffResolverImpl_1 = require("../src/resolver/HandoffResolverImpl");
(0, globals_1.describe)('Kill-Switch', () => {
    let tempStore;
    let sender;
    let killSwitch;
    let observability;
    let resolver;
    const testStateDir = path.join(__dirname, '../test-data-killswitch');
    (0, globals_1.beforeEach)(() => {
        // Limpiar directorio de test antes de cada test
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        tempStore = new InMemoryTempStore_1.InMemoryTempStore();
        sender = new NoopSender_1.NoopSender();
        killSwitch = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        observability = new ConsoleObservability_1.ConsoleObservability();
        resolver = new HandoffResolverImpl_1.HandoffResolverImpl(tempStore, sender, killSwitch, observability);
        tempStore.clear();
    });
    (0, globals_1.afterEach)(() => {
        // Limpiar después de cada test
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
    });
    (0, globals_1.it)('debe rechazar solicitudes cuando kill-switch está activo en modo DROP', async () => {
        // Activar kill-switch en modo DROP
        await killSwitch.activate('DROP');
        // Crear handoff válido (UUID v4)
        const handoff = {
            handoff_id: '550e8400-e29b-41d4-a716-446655440000',
            session_id: 'session-1',
            user_ref: 'user-1',
            model_ref: 'model-1',
            status: 'CREATED',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        await tempStore.create(handoff);
        // Intentar resolver debe fallar
        const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440000');
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.message).toBe('Servicio temporalmente no disponible');
        (0, globals_1.expect)(result.error_type).toBe('kill_switch_active');
    });
    (0, globals_1.it)('debe procesar pero no ejecutar sender cuando kill-switch está en modo SILENCIO', async () => {
        // Activar kill-switch en modo SILENCIO
        await killSwitch.activate('SILENCIO');
        // Crear handoff válido (UUID v4)
        const handoff = {
            handoff_id: '550e8400-e29b-41d4-a716-446655440001',
            session_id: 'session-1',
            user_ref: 'user-1',
            model_ref: 'model-1',
            status: 'CREATED',
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
        };
        await tempStore.create(handoff);
        // Resolver debe procesar pero no ejecutar sender
        const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440001');
        // En modo SILENCIO, el handoff se marca como REDEEMED pero no se ejecuta sender
        (0, globals_1.expect)(result.success).toBe(true);
        // Verificar que handoff fue marcado como REDEEMED
        const getResult = await tempStore.get('550e8400-e29b-41d4-a716-446655440001');
        (0, globals_1.expect)(getResult.handoff?.status).toBe('REDEEMED');
    });
});
