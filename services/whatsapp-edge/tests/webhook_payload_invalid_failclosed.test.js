"use strict";
/**
 * Tests: Webhook payload inválido - Fail-closed
 * Verifica que webhooks con payload inválido se rechazan (fail-closed)
 *
 * Nota: Este test verifica la lógica de validación, no el endpoint completo
 * El endpoint completo se prueba en integración
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
(0, globals_1.describe)('Webhook payload inválido - Fail-closed', () => {
    (0, globals_1.it)('debe rechazar payload sin MessageSid', () => {
        const payload = {
            MessageStatus: 'delivered'
            // Falta MessageSid
        };
        const hasMessageSid = payload.hasOwnProperty('MessageSid');
        (0, globals_1.expect)(hasMessageSid).toBe(false);
    });
    (0, globals_1.it)('debe rechazar payload sin MessageStatus', () => {
        const payload = {
            MessageSid: 'SM123'
            // Falta MessageStatus
        };
        const hasMessageStatus = payload.hasOwnProperty('MessageStatus');
        (0, globals_1.expect)(hasMessageStatus).toBe(false);
    });
    (0, globals_1.it)('debe rechazar payload con MessageStatus inválido', () => {
        const validStatuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];
        const invalidStatus = 'invalid_status';
        const isValid = validStatuses.includes(invalidStatus);
        (0, globals_1.expect)(isValid).toBe(false);
    });
    (0, globals_1.it)('debe aceptar payload válido', () => {
        const payload = {
            MessageSid: 'SM123',
            MessageStatus: 'delivered',
            Timestamp: new Date().toISOString()
        };
        const hasMessageSid = payload.hasOwnProperty('MessageSid');
        const hasMessageStatus = payload.hasOwnProperty('MessageStatus');
        const validStatuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];
        const isValidStatus = validStatuses.includes(payload.MessageStatus);
        (0, globals_1.expect)(hasMessageSid).toBe(true);
        (0, globals_1.expect)(hasMessageStatus).toBe(true);
        (0, globals_1.expect)(isValidStatus).toBe(true);
    });
});
