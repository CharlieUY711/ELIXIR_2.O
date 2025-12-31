/**
 * Implementación in-memory del Kill-Switch
 * Solo para DEV - En producción usar implementación persistente
 */

import { IKillSwitch, KillSwitchState, KillSwitchMode } from '../contracts/KillSwitch';

export class InMemoryKillSwitch implements IKillSwitch {
  private state: KillSwitchState = {
    active: false
  };

  async activate(mode: KillSwitchMode): Promise<{ success: boolean; error?: string }> {
    try {
      this.state = {
        active: true,
        mode,
        activated_at: new Date().toISOString()
      };
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error al activar kill-switch: ${error}`
      };
    }
  }

  async deactivate(): Promise<{ success: boolean; error?: string }> {
    try {
      this.state = {
        active: false
      };
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error al desactivar kill-switch: ${error}`
      };
    }
  }

  async isActive(): Promise<KillSwitchState> {
    return { ...this.state };
  }
}

