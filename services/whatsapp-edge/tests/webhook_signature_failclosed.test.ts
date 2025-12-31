/**
 * Tests: Webhook signature validation - Fail-closed
 * Verifica que webhooks con firma inválida se rechazan (fail-closed)
 */

import { describe, it, expect } from '@jest/globals';
import { validateTwilioSignature } from '../src/webhooks/twilioSignatureValidator';

describe('Webhook signature validation - Fail-closed', () => {
  it('debe rechazar firma inválida', () => {
    const authToken = 'test_auth_token';
    const url = 'https://example.com/webhooks/twilio/status';
    const params = {
      MessageSid: 'SM123',
      MessageStatus: 'delivered'
    };
    const invalidSignature = 'invalid_signature';

    const result = validateTwilioSignature(authToken, url, params, invalidSignature);
    expect(result).toBe(false);
  });

  it('debe aceptar firma válida', () => {
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

    const result = validateTwilioSignature(authToken, url, params, validSignature);
    expect(result).toBe(true);
  });

  it('debe rechazar si falta authToken', () => {
    const url = 'https://example.com/webhooks/twilio/status';
    const params = {
      MessageSid: 'SM123',
      MessageStatus: 'delivered'
    };
    const signature = 'some_signature';

    const result = validateTwilioSignature('', url, params, signature);
    expect(result).toBe(false);
  });

  it('debe rechazar si falta signature', () => {
    const authToken = 'test_auth_token';
    const url = 'https://example.com/webhooks/twilio/status';
    const params = {
      MessageSid: 'SM123',
      MessageStatus: 'delivered'
    };

    const result = validateTwilioSignature(authToken, url, params, '');
    expect(result).toBe(false);
  });
});

