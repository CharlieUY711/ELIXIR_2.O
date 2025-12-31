"use strict";
/**
 * Tests: Webhook signature validation - Fail-closed
 * Verifica que webhooks con firma inválida se rechazan (fail-closed)
 */
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const twilioSignatureValidator_1 = require("../src/webhooks/twilioSignatureValidator");
(0, globals_1.describe)('Webhook signature validation - Fail-closed', () => {
    (0, globals_1.it)('debe rechazar firma inválida', () => {
        const authToken = 'test_auth_token';
        const url = 'https://example.com/webhooks/twilio/status';
        const params = {
            MessageSid: 'SM123',
            MessageStatus: 'delivered'
        };
        const invalidSignature = 'invalid_signature';
        const result = (0, twilioSignatureValidator_1.validateTwilioSignature)(authToken, url, params, invalidSignature);
        (0, globals_1.expect)(result).toBe(false);
    });
    (0, globals_1.it)('debe aceptar firma válida', () => {
        const authToken = 'test_auth_token';
        const url = 'https://example.com/webhooks/twilio/status';
        const params = {
            MessageSid: 'SM123',
            MessageStatus: 'delivered'
        };
        // Calcular firma válida manualmente
        const crypto = require('crypto');
        const sortedParams = Object.keys(params)
            .sort()
            .map(key => `${key}${params[key]}`)
            .join('');
        const data = url + sortedParams;
        const hmac = crypto.createHmac('sha1', authToken);
        hmac.update(data);
        const validSignature = hmac.digest('base64');
        const result = (0, twilioSignatureValidator_1.validateTwilioSignature)(authToken, url, params, validSignature);
        (0, globals_1.expect)(result).toBe(true);
    });
    (0, globals_1.it)('debe rechazar si falta authToken', () => {
        const url = 'https://example.com/webhooks/twilio/status';
        const params = {
            MessageSid: 'SM123',
            MessageStatus: 'delivered'
        };
        const signature = 'some_signature';
        const result = (0, twilioSignatureValidator_1.validateTwilioSignature)('', url, params, signature);
        (0, globals_1.expect)(result).toBe(false);
    });
    (0, globals_1.it)('debe rechazar si falta signature', () => {
        const authToken = 'test_auth_token';
        const url = 'https://example.com/webhooks/twilio/status';
        const params = {
            MessageSid: 'SM123',
            MessageStatus: 'delivered'
        };
        const result = (0, twilioSignatureValidator_1.validateTwilioSignature)(authToken, url, params, '');
        (0, globals_1.expect)(result).toBe(false);
    });
});
