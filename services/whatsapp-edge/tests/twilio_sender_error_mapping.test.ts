/**
 * Tests: TwilioSender - Error Mapping
 * Verifica que errores de Twilio se mapean correctamente a categorías genéricas
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { TwilioSender } from '../src/sender/TwilioSender';
import { PersistentKillSwitch } from '../src/killswitch/PersistentKillSwitch';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';
import * as fs from 'fs';
import * as path from 'path';

// Mock de Twilio
jest.mock('twilio', () => {
  return {
    __esModule: true,
    default: jest.fn(() => ({
      messages: {
        create: jest.fn()
      }
    }))
  };
});

describe('TwilioSender - Error Mapping', () => {
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let sender: TwilioSender;
  const testStateDir = path.join(__dirname, '../test-data-error-mapping');

  beforeEach(() => {
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    
    process.env.TWILIO_ACCOUNT_SID = 'ACtest';
    process.env.TWILIO_AUTH_TOKEN = 'test_token';
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
    process.env.WAM_SENDER_ENABLED = 'true';
    process.env.PROVIDER_TIMEOUT_MS = '10000';

    killSwitch = new PersistentKillSwitch(testStateDir);
    observability = new ConsoleObservability();
    sender = new TwilioSender(killSwitch, observability);
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

  it('debe mapear error 401 a invalid_credentials', async () => {
    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    mockClient.messages.create.mockRejectedValue(error);

    const result = await sender.send({
      handoff_id: 'test-handoff-401',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('invalid_credentials');
  });

  it('debe mapear error 403 a invalid_credentials', async () => {
    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    const error = new Error('Forbidden');
    (error as any).status = 403;
    mockClient.messages.create.mockRejectedValue(error);

    const result = await sender.send({
      handoff_id: 'test-handoff-403',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('invalid_credentials');
  });

  it('debe mapear error genérico a provider_error', async () => {
    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    const error = new Error('Generic error');
    (error as any).status = 500;
    mockClient.messages.create.mockRejectedValue(error);

    const result = await sender.send({
      handoff_id: 'test-handoff-generic',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('provider_error');
  });

  it('debe mapear status "failed" a provider_error', async () => {
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

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('provider_error');
  });

  it('debe mapear status "queued" a success', async () => {
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

    expect(result.success).toBe(true);
    expect(result.error_type).toBeUndefined();
  });
});

