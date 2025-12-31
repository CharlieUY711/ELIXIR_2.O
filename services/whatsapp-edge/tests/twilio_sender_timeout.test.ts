/**
 * Tests: TwilioSender - Timeout
 * Verifica que TwilioSender maneja timeouts correctamente
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

describe('TwilioSender - Timeout', () => {
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let sender: TwilioSender;
  const testStateDir = path.join(__dirname, '../test-data-timeout');

  beforeEach(() => {
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    
    // Configurar variables de entorno para test
    process.env.TWILIO_ACCOUNT_SID = 'ACtest';
    process.env.TWILIO_AUTH_TOKEN = 'test_token';
    process.env.TWILIO_WHATSAPP_FROM = 'whatsapp:+1234567890';
    process.env.WAM_SENDER_ENABLED = 'true';
    process.env.PROVIDER_TIMEOUT_MS = '100'; // Timeout corto para test

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

  it('debe retornar error de timeout cuando la llamada excede el timeout', async () => {
    const twilio = require('twilio');
    const mockClient = twilio.default();
    
    // Simular timeout: la promesa nunca se resuelve
    mockClient.messages.create.mockImplementation(() => {
      return new Promise(() => {
        // Nunca resuelve, causando timeout
      });
    });

    const result = await sender.send({
      handoff_id: 'test-handoff-timeout',
      user_ref: '+1234567890',
      model_ref: '+0987654321'
    });

    expect(result.success).toBe(false);
    expect(result.error_type).toBe('provider_timeout');
  }, 10000); // Timeout del test más largo que el timeout del sender
});

