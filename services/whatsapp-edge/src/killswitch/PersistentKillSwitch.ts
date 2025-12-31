/**
 * Implementación persistente del Kill-Switch
 * Almacena estado en archivo local para sobrevivir a restarts
 */

import * as fs from 'fs';
import * as path from 'path';
import { IKillSwitch, KillSwitchState, KillSwitchMode } from '../contracts/KillSwitch';

export class PersistentKillSwitch implements IKillSwitch {
  private readonly stateFilePath: string;
  private state: KillSwitchState;

  constructor(stateDir: string = process.env.KILLSWITCH_STATE_DIR || './data') {
    // Crear directorio si no existe
    if (!fs.existsSync(stateDir)) {
      fs.mkdirSync(stateDir, { recursive: true });
    }

    this.stateFilePath = path.join(stateDir, 'killswitch-state.json');
    this.state = this.loadState();
  }

  async activate(mode: KillSwitchMode): Promise<{ success: boolean; error?: string }> {
    try {
      this.state = {
        active: true,
        mode,
        activated_at: new Date().toISOString()
      };
      
      await this.saveState();
      
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
      
      await this.saveState();
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: `Error al desactivar kill-switch: ${error}`
      };
    }
  }

  async isActive(): Promise<KillSwitchState> {
    // Recargar estado desde disco para garantizar consistencia
    this.state = this.loadState();
    return { ...this.state };
  }

  private loadState(): KillSwitchState {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const content = fs.readFileSync(this.stateFilePath, 'utf-8');
        const parsed = JSON.parse(content) as KillSwitchState;
        
        // Validar estructura básica
        if (typeof parsed.active === 'boolean') {
          return {
            active: parsed.active,
            mode: parsed.mode,
            activated_at: parsed.activated_at
          };
        }
      }
    } catch (error) {
      // Si hay error al leer, iniciar con estado inactivo (fail-closed)
      console.error(`[KillSwitch] Error al cargar estado: ${error}`);
    }
    
    // Estado por defecto: inactivo
    return { active: false };
  }

  private async saveState(): Promise<void> {
    try {
      const content = JSON.stringify(this.state, null, 2);
      fs.writeFileSync(this.stateFilePath, content, 'utf-8');
    } catch (error) {
      console.error(`[KillSwitch] Error al guardar estado: ${error}`);
      throw error;
    }
  }
}

