/**
 * Contrato del Kill-Switch
 * Mecanismo de detención inmediata del canal
 */

export type KillSwitchMode = 'DROP' | 'SILENCIO';

export interface KillSwitchState {
  active: boolean;
  mode?: KillSwitchMode;
  activated_at?: string;  // ISO 8601
}

export interface IKillSwitch {
  /**
   * Activa kill-switch en modo especificado
   * @param mode Modo de operación (DROP o SILENCIO)
   * @returns Resultado de la operación
   */
  activate(mode: KillSwitchMode): Promise<{ success: boolean; error?: string }>;

  /**
   * Desactiva kill-switch
   * @returns Resultado de la operación
   */
  deactivate(): Promise<{ success: boolean; error?: string }>;

  /**
   * Consulta estado actual de kill-switch
   * @returns Estado del kill-switch
   */
  isActive(): Promise<KillSwitchState>;
}

