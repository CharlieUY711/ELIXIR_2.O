/**
 * Tests: Idempotencia
 * Verifica que operaciones repetidas no tienen efectos adicionales
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryTempStore } from '../src/storage/InMemoryTempStore';
import { NoopSender } from '../src/sender/NoopSender';
import { InMemoryKillSwitch } from '../src/killswitch/InMemoryKillSwitch';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';
import { HandoffResolverImpl } from '../src/resolver/HandoffResolverImpl';
import { Handoff } from '../src/types/Handoff';

describe('Idempotencia', () => {
  let tempStore: InMemoryTempStore;
  let sender: NoopSender;
  let killSwitch: InMemoryKillSwitch;
  let observability: ConsoleObservability;
  let resolver: HandoffResolverImpl;

  beforeEach(() => {
    tempStore = new InMemoryTempStore();
    sender = new NoopSender();
    killSwitch = new InMemoryKillSwitch();
    observability = new ConsoleObservability();
    resolver = new HandoffResolverImpl(tempStore, sender, killSwitch, observability);
    tempStore.clear();
  });

  it('debe ser idempotente resolver handoff ya REDEEMED', async () => {
    // Crear handoff y resolverlo primero
    const handoff: Handoff = {
      handoff_id: 'test-handoff-idempotent',
      session_id: 'session-1',
      user_ref: 'user-1',
      model_ref: 'model-1',
      status: 'CREATED',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    };

    await tempStore.create(handoff);
    
    // Resolver primero para marcarlo como REDEEMED
    await resolver.resolve('test-handoff-idempotent');

    // Múltiples intentos de resolución deben retornar mismo resultado
    const result1 = await resolver.resolve('test-handoff-idempotent');
    const result2 = await resolver.resolve('test-handoff-idempotent');
    const result3 = await resolver.resolve('test-handoff-idempotent');

    expect(result1.success).toBe(false);
    expect(result2.success).toBe(false);
    expect(result3.success).toBe(false);
    expect(result1.message).toBe(result2.message);
    expect(result2.message).toBe(result3.message);
  });
});

