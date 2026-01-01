/**
 * InMemoryKillSwitchProvider - Implementación en memoria del proveedor de kill-switch
 * 
 * NOTA: Esta es una implementación de ejemplo para desarrollo.
 * En producción, debe reemplazarse por una implementación que consulte
 * el kill-switch real del sistema (por ejemplo, el PersistentKillSwitch de WAM).
 */

import { IKillSwitchProvider, KillSwitchState } from '../contracts/IKillSwitchProvider';

export class InMemoryKillSwitchProvider implements IKillSwitchProvider {
  private killSwitchState: KillSwitchState;

  constructor(initialState: KillSwitchState = { active: false }) {
    this.killSwitchState = { ...initialState };
  }

  async getKillSwitchState(): Promise<KillSwitchState> {
    return { ...this.killSwitchState };
  }

  /**
   * Activa el kill-switch (solo para testing)
   */
  activate(mode: 'DROP' | 'SILENCIO' = 'DROP'): void {
    this.killSwitchState = {
      active: true,
      mode,
      activated_at: new Date().toISOString()
    };
  }

  /**
   * Desactiva el kill-switch (solo para testing)
   */
  deactivate(): void {
    this.killSwitchState = {
      active: false
    };
  }
}

