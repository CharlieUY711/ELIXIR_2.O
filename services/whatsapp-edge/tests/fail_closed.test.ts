/**
 * Tests: Fail-Closed
 * Verifica que cualquier falla resulta en rechazo de handoff
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { InMemoryTempStore } from '../src/storage/InMemoryTempStore';
import { NoopSender } from '../src/sender/NoopSender';
import { InMemoryKillSwitch } from '../src/killswitch/InMemoryKillSwitch';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';
import { HandoffResolverImpl } from '../src/resolver/HandoffResolverImpl';

describe('Fail-Closed', () => {
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

  it('debe rechazar handoff no encontrado', async () => {
    const result = await resolver.resolve('handoff-inexistente');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Enlace inválido');
  });

  it('debe rechazar handoff con formato inválido', async () => {
    const result = await resolver.resolve('invalid-format');
    expect(result.success).toBe(false);
    expect(result.message).toBe('Enlace inválido');
    expect(result.error_type).toBe('invalid_handoff_id');
  });
});

