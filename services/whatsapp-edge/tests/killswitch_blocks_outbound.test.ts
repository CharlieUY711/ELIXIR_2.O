/**
 * Tests: Kill-Switch bloquea outbound
 * Verifica que kill-switch bloquea TwilioSender correctamente
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
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

describe('Kill-Switch bloquea outbound', () => {
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let sender: TwilioSender;
  const testStateDir = path.join(__dirname, '../test-data-killswitch-outbound');

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

  it('debe bloquear outbound cuando kill-switch está en modo DROP', async () => {
    await killSwitch.activate('DROP');

    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    // No debería llamarse
    mockClient.messages.create.mockResolvedValue({
      sid: 'SM123',
      status: 'queued'
    });

    const result = await sender.send({
      handoff_id: 'test-handoff-drop',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('provider_unavailable');
    // Verificar que NO se llamó a Twilio
    expect(mockClient.messages.create).not.toHaveBeenCalled();
  });

  it('debe bloquear outbound cuando kill-switch está en modo SILENCIO', async () => {
    await killSwitch.activate('SILENCIO');

    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    // No debería llamarse
    mockClient.messages.create.mockResolvedValue({
      sid: 'SM123',
      status: 'queued'
    });

    const result = await sender.send({
      handoff_id: 'test-handoff-silencio',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('provider_unavailable');
    // Verificar que NO se llamó a Twilio
    expect(mockClient.messages.create).not.toHaveBeenCalled();
  });
});

