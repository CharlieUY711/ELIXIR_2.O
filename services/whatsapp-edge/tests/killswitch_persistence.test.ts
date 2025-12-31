/**
 * Tests: Kill-Switch Persistente
 * Verifica que el estado del kill-switch sobrevive a restarts
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import * as fs from 'fs';
import * as path from 'path';
import { PersistentKillSwitch } from '../src/killswitch/PersistentKillSwitch';

describe('Kill-Switch Persistente', () => {
  const testStateDir = path.join(__dirname, '../test-data-killswitch');
  let killSwitch: PersistentKillSwitch;

  beforeEach(() => {
    // Limpiar directorio de test antes de cada test
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
    killSwitch = new PersistentKillSwitch(testStateDir);
  });

  afterEach(() => {
    // Limpiar después de cada test
    if (fs.existsSync(testStateDir)) {
      fs.rmSync(testStateDir, { recursive: true, force: true });
    }
  });

  it('debe persistir estado activo en modo DROP', async () => {
    // Activar kill-switch
    const result = await killSwitch.activate('DROP');
    expect(result.success).toBe(true);

    // Crear nueva instancia (simula restart)
    const killSwitch2 = new PersistentKillSwitch(testStateDir);
    const state = await killSwitch2.isActive();

    expect(state.active).toBe(true);
    expect(state.mode).toBe('DROP');
    expect(state.activated_at).toBeDefined();
  });

  it('debe persistir estado activo en modo SILENCIO', async () => {
    // Activar kill-switch
    const result = await killSwitch.activate('SILENCIO');
    expect(result.success).toBe(true);

    // Crear nueva instancia (simula restart)
    const killSwitch2 = new PersistentKillSwitch(testStateDir);
    const state = await killSwitch2.isActive();

    expect(state.active).toBe(true);
    expect(state.mode).toBe('SILENCIO');
    expect(state.activated_at).toBeDefined();
  });

  it('debe persistir estado desactivado', async () => {
    // Activar y luego desactivar
    await killSwitch.activate('DROP');
    const deactivateResult = await killSwitch.deactivate();
    expect(deactivateResult.success).toBe(true);

    // Crear nueva instancia (simula restart)
    const killSwitch2 = new PersistentKillSwitch(testStateDir);
    const state = await killSwitch2.isActive();

    expect(state.active).toBe(false);
  });

  it('debe iniciar con estado inactivo si no hay archivo', async () => {
    // Nueva instancia sin archivo previo
    const state = await killSwitch.isActive();
    expect(state.active).toBe(false);
  });

  it('debe recuperarse de archivo corrupto iniciando inactivo (fail-closed)', async () => {
    // Crear archivo corrupto
    const stateFilePath = path.join(testStateDir, 'killswitch-state.json');
    fs.mkdirSync(testStateDir, { recursive: true });
    fs.writeFileSync(stateFilePath, 'invalid json', 'utf-8');

    // Nueva instancia debe iniciar inactiva (fail-closed)
    const killSwitch2 = new PersistentKillSwitch(testStateDir);
    const state = await killSwitch2.isActive();
    expect(state.active).toBe(false);
  });
});

