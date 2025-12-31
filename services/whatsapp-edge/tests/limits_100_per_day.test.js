"use strict";
/**
 * Tests: Límites operativos - 100 handoffs/día
 * Verifica que el límite diario se aplica correctamente
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
const OperationalLimits_1 = require("../src/guardrails/OperationalLimits");
const PersistentKillSwitch_1 = require("../src/killswitch/PersistentKillSwitch");
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
(0, globals_1.describe)('Límites operativos - 100 handoffs/día', () => {
    let killSwitch;
    let observability;
    let limits;
    const testStateDir = path.join(__dirname, '../test-data-limits');
    (0, globals_1.beforeEach)(() => {
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        process.env.OPERATIONAL_MAX_HANDOFFS_PER_DAY = '100';
        process.env.OPERATIONAL_MAX_CONCURRENT_USERS = '10';
        killSwitch = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        observability = new ConsoleObservability_1.ConsoleObservability();
        limits = new OperationalLimits_1.OperationalLimits(killSwitch, observability);
    });
    afterEach(() => {
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        delete process.env.OPERATIONAL_MAX_HANDOFFS_PER_DAY;
        delete process.env.OPERATIONAL_MAX_CONCURRENT_USERS;
    });
    (0, globals_1.it)('debe permitir handoffs hasta el límite diario', async () => {
        // Procesar 100 handoffs
        for (let i = 0; i < 100; i++) {
            const check = await limits.canProcessHandoff(`handoff-${i}`);
            (0, globals_1.expect)(check.allowed).toBe(true);
            limits.recordHandoffStart(`handoff-${i}`);
            limits.recordSuccess(`handoff-${i}`);
        }
        // El 101 debe ser rechazado
        const check101 = await limits.canProcessHandoff('handoff-101');
        (0, globals_1.expect)(check101.allowed).toBe(false);
        (0, globals_1.expect)(check101.reason).toBe('daily_limit_exceeded');
    });
    (0, globals_1.it)('debe rechazar cuando se excede el límite de concurrencia', async () => {
        // Iniciar 10 handoffs simultáneos
        for (let i = 0; i < 10; i++) {
            const check = await limits.canProcessHandoff(`handoff-${i}`);
            (0, globals_1.expect)(check.allowed).toBe(true);
            limits.recordHandoffStart(`handoff-${i}`);
        }
        // El 11 debe ser rechazado
        const check11 = await limits.canProcessHandoff('handoff-11');
        (0, globals_1.expect)(check11.allowed).toBe(false);
        (0, globals_1.expect)(check11.reason).toBe('concurrent_limit_exceeded');
    });
});
