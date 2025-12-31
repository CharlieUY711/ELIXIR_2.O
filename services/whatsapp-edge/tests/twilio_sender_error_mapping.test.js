"use strict";
/**
 * Tests: TwilioSender - Error Mapping
 * Verifica que errores de Twilio se mapean correctamente a categorías genéricas
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
const TwilioSender_1 = require("../src/sender/TwilioSender");
const PersistentKillSwitch_1 = require("../src/killswitch/PersistentKillSwitch");
const ConsoleObservability_1 = require("../src/observability/ConsoleObservability");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Mock de Twilio
globals_1.jest.mock('twilio', () => {
    return {
        __esModule: true,
        default: globals_1.jest.fn(() => ({
            messages: {
                create: globals_1.jest.fn()
            }
        }))
    };
});
(0, globals_1.describe)('TwilioSender - Error Mapping', () => {
    let killSwitch;
    let observability;
    let sender;
    const testStateDir = path.join(__dirname, '../test-data-error-mapping');
    (0, globals_1.beforeEach)(() => {
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        process.env.TWILIO_ACCOUNT_SID = 'ACtest';
        process.env.TWILIO_AUTH_TOKEN = 'test_token';
        process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
        process.env.WAM_SENDER_ENABLED = 'true';
        process.env.PROVIDER_TIMEOUT_MS = '10000';
        killSwitch = new PersistentKillSwitch_1.PersistentKillSwitch(testStateDir);
        observability = new ConsoleObservability_1.ConsoleObservability();
        sender = new TwilioSender_1.TwilioSender(killSwitch, observability);
    });
    afterEach(() => {
        if (fs.existsSync(testStateDir)) {
            fs.rmSync(testStateDir, { recursive: true, force: true });
        }
        delete process.env.TWILIO_ACCOUNT_SID;
        delete process.env.TWILIO_AUTH_TOKEN;
        delete process.env.TWILIO_WHATSAPP_FROM;
        delete process.env.WAM_SENDER_ENABLED;
        delete process.env.PROVIDER_TIMEOUT_MS;
    });
    (0, globals_1.it)('debe mapear error 401 a invalid_credentials', async () => {
        const twilio = require('twilio');
        const mockClient = twilio.default();
        const error = new Error('Unauthorized');
        error.status = 401;
        mockClient.messages.create.mockRejectedValue(error);
        const result = await sender.send({
            handoff_id: 'test-handoff-401',
            user_ref: '+1234567890',
            model_ref: '+0987654321'
        });
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.error_type).toBe('invalid_credentials');
    });
    (0, globals_1.it)('debe mapear error 403 a invalid_credentials', async () => {
        const twilio = require('twilio');
        const mockClient = twilio.default();
        const error = new Error('Forbidden');
        error.status = 403;
        mockClient.messages.create.mockRejectedValue(error);
        const result = await sender.send({
            handoff_id: 'test-handoff-403',
            user_ref: '+1234567890',
            model_ref: '+0987654321'
        });
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.error_type).toBe('invalid_credentials');
    });
    (0, globals_1.it)('debe mapear error genérico a provider_error', async () => {
        const twilio = require('twilio');
        const mockClient = twilio.default();
        const error = new Error('Generic error');
        error.status = 500;
        mockClient.messages.create.mockRejectedValue(error);
        const result = await sender.send({
            handoff_id: 'test-handoff-generic',
            user_ref: '+1234567890',
            model_ref: '+0987654321'
        });
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.error_type).toBe('provider_error');
    });
    (0, globals_1.it)('debe mapear status "failed" a provider_error', async () => {
        const twilio = require('twilio');
        const mockClient = twilio.default();
        mockClient.messages.create.mockResolvedValue({
            sid: 'SM123',
            status: 'failed',
            errorCode: null
        });
        const result = await sender.send({
            handoff_id: 'test-handoff-failed',
            user_ref: '+1234567890',
            model_ref: '+0987654321'
        });
        (0, globals_1.expect)(result.success).toBe(false);
        (0, globals_1.expect)(result.error_type).toBe('provider_error');
    });
    (0, globals_1.it)('debe mapear status "queued" a success', async () => {
        const twilio = require('twilio');
        const mockClient = twilio.default();
        mockClient.messages.create.mockResolvedValue({
            sid: 'SM123',
            status: 'queued',
            errorCode: null
        });
        const result = await sender.send({
            handoff_id: 'test-handoff-queued',
            user_ref: '+1234567890',
            model_ref: '+0987654321'
        });
        (0, globals_1.expect)(result.success).toBe(true);
        (0, globals_1.expect)(result.error_type).toBeUndefined();
    });
});
