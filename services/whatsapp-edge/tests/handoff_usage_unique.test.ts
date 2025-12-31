/**
 * Tests: Uso único del handoff
 * Verifica que cada handoff se consume exactamente una vez
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { InMemoryTempStore } from '../src/storage/InMemoryTempStore';
import { NoopSender } from '../src/sender/NoopSender';
import { PersistentKillSwitch } from '../src/killswitch/PersistentKillSwitch';
import * as fs from 'fs';
import * as path from 'path';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';
import { HandoffResolverImpl } from '../src/resolver/HandoffResolverImpl';
import { Handoff } from '../src/types/Handoff';

describe('Uso único del handoff', () => {
  let tempStore: InMemoryTempStore;
  let sender: NoopSender;
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let resolver: HandoffResolverImpl;
  const testStateDir = path.join(__dirname, '../test-data-killswitch-usage');

  beforeEach(() => {
    // Limpiar directorio de test antes de cada test
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    tempStore = new InMemoryTempStore();
    sender = new NoopSender();
    killSwitch = new PersistentKillSwitch(testStateDir);
    observability = new ConsoleObservability();
    resolver = new HandoffResolverImpl(tempStore, sender, killSwitch, observability);
    tempStore.clear();
  });

  afterEach(() => {
    // Limpiar después de cada test
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
  });

  it('debe resolver handoff una sola vez', async () => {
    // Crear handoff (UUID v4)
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440010',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    await tempStore.create(handoff);

    // Primera resolución debe ser exitosa
    const result1 = await resolver.resolve('550e8400-e29b-41d4-a716-446655440010');
    expect(result1.success).toBe(true);

    // Segunda resolución debe fallar (ya utilizado)
    const result2 = await resolver.resolve('550e8400-e29b-41d4-a716-446655440010');
    expect(result2.success).toBe(false);
    expect(result2.message).toBe('Este enlace ya ha sido utilizado');
    expect(result2.error_type).toBe('handoff_already_redeemed');
  });

  it('debe marcar handoff como REDEEMED después de primera resolución', async () => {
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440020',
      session_id: 'session-2',
      user_ref: 'user-2',
      model_ref: 'model-2',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    await tempStore.create(handoff);

    // Resolver
    await resolver.resolve('550e8400-e29b-41d4-a716-446655440020');

    // Verificar que estado cambió a REDEEMED
    const getResult = await tempStore.get('550e8400-e29b-41d4-a716-446655440020');
    expect(getResult.handoff).toBeDefined();
    expect(getResult.handoff?.status).toBe('REDEEMED');
  });
});

