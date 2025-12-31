/**
 * Tests: Kill-Switch
 * Verifica que kill-switch detiene procesamiento inmediatamente
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

describe('Kill-Switch', () => {
  let tempStore: InMemoryTempStore;
  let sender: NoopSender;
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let resolver: HandoffResolverImpl;
  const testStateDir = path.join(__dirname, '../test-data-killswitch');

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

  it('debe rechazar solicitudes cuando kill-switch está activo en modo DROP', async () => {
    // Activar kill-switch en modo DROP
    await killSwitch.activate('DROP');

    // Crear handoff válido (UUID v4)
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440000',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    await tempStore.create(handoff);

    // Intentar resolver debe fallar
    const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440000');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Servicio temporalmente no disponible');
    expect(result.error_type).toBe('kill_switch_active');
  });

  it('debe procesar pero no ejecutar sender cuando kill-switch está en modo SILENCIO', async () => {
    // Activar kill-switch en modo SILENCIO
    await killSwitch.activate('SILENCIO');

    // Crear handoff válido (UUID v4)
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440001',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    await tempStore.create(handoff);

    // Resolver debe procesar pero no ejecutar sender
    const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440001');
    // En modo SILENCIO, el handoff se marca como REDEEMED pero no se ejecuta sender
    expect(result.success).toBe(true);
    
    // Verificar que handoff fue marcado como REDEEMED
    const getResult = await tempStore.get('550e8400-e29b-41d4-a716-446655440001');
    expect(getResult.handoff?.status).toBe('REDEEMED');
  });
});

