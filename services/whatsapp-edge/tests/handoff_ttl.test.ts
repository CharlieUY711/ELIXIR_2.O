/**
 * Tests: TTL y expiración
 * Verifica que handoffs expiran correctamente después de TTL
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

describe('TTL y expiración', () => {
  let tempStore: InMemoryTempStore;
  let sender: NoopSender;
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let resolver: HandoffResolverImpl;
  const testStateDir = path.join(__dirname, '../test-data-killswitch-ttl');

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

  it('debe rechazar handoff expirado', async () => {
    // Crear handoff ya expirado (UUID v4)
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440030',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
      expires_at: new Date(Date.now() - 5 * 60 * 1000).toISOString()  // Expirado hace 5 minutos
    };

    await tempStore.create(handoff);

    // Intentar resolver debe fallar
    const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440030');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Este enlace ha expirado. Por favor, inicia nuevamente');
    expect(result.error_type).toBe('handoff_expired');
  });

  it('debe aceptar handoff válido dentro de TTL', async () => {
    // Crear handoff válido (UUID v4)
    const handoff: Handoff = {
      handoff_id: '550e8400-e29b-41d4-a716-446655440040',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // Válido por 5 minutos
    };

    await tempStore.create(handoff);

    // Resolver debe ser exitoso
    const result = await resolver.resolve('550e8400-e29b-41d4-a716-446655440040');
    expect(result.success).toBe(true);
  });
});

