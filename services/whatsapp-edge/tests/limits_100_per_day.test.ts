/**
 * Tests: Límites operativos - 100 handoffs/día
 * Verifica que el límite diario se aplica correctamente
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { OperationalLimits } from '../src/guardrails/OperationalLimits';
import { PersistentKillSwitch } from '../src/killswitch/PersistentKillSwitch';
import { ConsoleObservability } from '../src/observability/ConsoleObservability';
import * as fs from 'fs';
import * as path from 'path';

describe('Límites operativos - 100 handoffs/día', () => {
  let killSwitch: PersistentKillSwitch;
  let observability: ConsoleObservability;
  let limits: OperationalLimits;
  const testStateDir = path.join(__dirname, '../test-data-limits');

  beforeEach(() => {
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    
    process.env.OPERATIONAL_MAX_HANDOFFS_PER_DAY = '100';
    process.env.OPERATIONAL_MAX_CONCURRENT_USERS = '10';

    killSwitch = new PersistentKillSwitch(testStateDir);
    observability = new ConsoleObservability();
    limits = new OperationalLimits(killSwitch, observability);
  });

  afterEach(() => {
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    delete process.env.OPERATIONAL_MAX_HANDOFFS_PER_DAY;
    delete process.env.OPERATIONAL_MAX_CONCURRENT_USERS;
  });

  it('debe permitir handoffs hasta el límite diario', async () => {
    // Procesar 100 handoffs
    for (let i = 0; i < 100; i++) {
      const check = await limits.canProcessHandoff(`handoff-${i}`);
      expect(check.allowed).toBe(true);
      limits.recordHandoffStart(`handoff-${i}`);
      limits.recordSuccess(`handoff-${i}`);
    }

    // El 101 debe ser rechazado
    const check101 = await limits.canProcessHandoff('handoff-101');
    expect(check101.allowed).toBe(false);
    expect(check101.reason).toBe('daily_limit_exceeded');
  });

  it('debe rechazar cuando se excede el límite de concurrencia', async () => {
    // Iniciar 10 handoffs simultáneos
    for (let i = 0; i < 10; i++) {
      const check = await limits.canProcessHandoff(`handoff-${i}`);
      expect(check.allowed).toBe(true);
      limits.recordHandoffStart(`handoff-${i}`);
    }

    // El 11 debe ser rechazado
    const check11 = await limits.canProcessHandoff('handoff-11');
    expect(check11.allowed).toBe(false);
    expect(check11.reason).toBe('concurrent_limit_exceeded');
  });
});

