/**
 * IKillSwitchProvider - Contrato para consulta de kill-switch global
 * 
 * Permite consultar el estado del kill-switch global.
 * Implementación concreta se provee externamente.
 */

export interface KillSwitchState {
  /**
   * Indica si el kill-switch está activo
   */
  active: boolean;
  
  /**
   * Modo del kill-switch (si está activo)
   */
  mode?: 'DROP' | 'SILENCIO';
  
  /**
   * Timestamp de activación (si está activo)
   */
  activated_at?: string;
}

export interface IKillSwitchProvider {
  /**
   * Consulta el estado del kill-switch global
   * @returns Estado del kill-switch
   */
  getKillSwitchState(): Promise<KillSwitchState>;
}

