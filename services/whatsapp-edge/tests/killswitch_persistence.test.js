"use strict";
/**
 * Tests: Kill-Switch Persistente
 * Verifica que el estado del kill-switch sobrevive a restarts
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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const PersistentKillSwitch_1 = require("../src/killswitch/PersistentKillSwitch");
(0, globals_1.describe)('Kill-Switch Persistente', () => {
    const testStateDir = path.join(__dirname, '../test-data-killswitch');
    let killSwitch;
    (0, globals_1.beforeEach)(() => {
        // Limpiar directorio de test antes de cada test
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        killSwitch = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
    });
    (0, globals_1.afterEach)(() => {
        // Limpiar después de cada test
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
    });
    (0, globals_1.it)('debe persistir estado activo en modo DROP', async () => {
        // Activar kill-switch
        const result = await killSwitch.activate('DROP');
        (0, globals_1.expect)(result.success).toBe(true);
        // Crear nueva instancia (simula restart)
        const killSwitch2 = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        const state = await killSwitch2.isActive();
        (0, globals_1.expect)(state.active).toBe(true);
        (0, globals_1.expect)(state.mode).toBe('DROP');
        (0, globals_1.expect)(state.activated_at).toBeDefined();
    });
    (0, globals_1.it)('debe persistir estado activo en modo SILENCIO', async () => {
        // Activar kill-switch
        const result = await killSwitch.activate('SILENCIO');
        (0, globals_1.expect)(result.success).toBe(true);
        // Crear nueva instancia (simula restart)
        const killSwitch2 = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        const state = await killSwitch2.isActive();
        (0, globals_1.expect)(state.active).toBe(true);
        (0, globals_1.expect)(state.mode).toBe('SILENCIO');
        (0, globals_1.expect)(state.activated_at).toBeDefined();
    });
    (0, globals_1.it)('debe persistir estado desactivado', async () => {
        // Activar y luego desactivar
        await killSwitch.activate('DROP');
        const deactivateResult = await killSwitch.deactivate();
        (0, globals_1.expect)(deactivateResult.success).toBe(true);
        // Crear nueva instancia (simula restart)
        const killSwitch2 = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        const state = await killSwitch2.isActive();
        (0, globals_1.expect)(state.active).toBe(false);
    });
    (0, globals_1.it)('debe iniciar con estado inactivo si no hay archivo', async () => {
        // Nueva instancia sin archivo previo
        const state = await killSwitch.isActive();
        (0, globals_1.expect)(state.active).toBe(false);
    });
    (0, globals_1.it)('debe recuperarse de archivo corrupto iniciando inactivo (fail-closed)', async () => {
        // Crear archivo corrupto
        const stateFilePath = path.join(testStateDir, 'killswitch-state.json');
        fs.mkdirSync(testStateDir, { recursive: true });
        fs.writeFileSync(stateFilePath, 'invalid json', 'utf-8');
        // Nueva instancia debe iniciar inactiva (fail-closed)
        const killSwitch2 = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        const state = await killSwitch2.isActive();
        (0, globals_1.expect)(state.active).toBe(false);
    });
});
