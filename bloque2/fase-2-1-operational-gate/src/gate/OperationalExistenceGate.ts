/**
 * OperationalExistenceGate - Gate de Existencia Operativa
 * 
 * FASE 2.1 - BLOQUE 2
 * 
 * Objetivo único:
 * Determinar si el sistema permite continuar a la FASE 2.2,
 * basándose únicamente en:
 * - existencia de un UserID válido
 * - estado operativo global del sistema
 * - estado del kill-switch global
 * 
 * Comportamiento por defecto:
 * - Ante error, inconsistencia o duda → DENY
 */

import { GateDecision } from '../domain/GateDecision';
import { GateRequest } from '../domain/GateRequest';
import { SystemOperationalState } from '../domain/SystemState';
import { IUserValidator } from '../contracts/IUserValidator';
import { ISystemStateProvider } from '../contracts/ISystemStateProvider';
import { IKillSwitchProvider } from '../contracts/IKillSwitchProvider';

export class OperationalExistenceGate {
  private userValidator: IUserValidator;
  private systemStateProvider: ISystemStateProvider;
  private killSwitchProvider: IKillSwitchProvider;

  constructor(
    userValidator: IUserValidator,
    systemStateProvider: ISystemStateProvider,
    killSwitchProvider: IKillSwitchProvider
  ) {
    this.userValidator = userValidator;
    this.systemStateProvider = systemStateProvider;
    this.killSwitchProvider = killSwitchProvider;
  }

  /**
   * Evalúa el gate de existencia operativa
   * 
   * Evaluaciones obligatorias:
   * 1. El usuario existe y es válido
   * 2. El sistema no está globalmente apagado
   * 3. El kill-switch global no está activo
   * 
   * @param request Solicitud del gate
   * @returns ALLOW si todas las condiciones se cumplen, DENY en caso contrario
   */
  async evaluate(request: GateRequest): Promise<GateDecision> {
    try {
      // Evaluación 1: El usuario existe y es válido
      const userValidation = await this.validateUser(request.userId);
      if (!userValidation.isValid) {
        return GateDecision.DENY;
      }

      // Evaluación 2: El sistema no está globalmente apagado
      const systemState = await this.validateSystemState();
      if (!systemState) {
        return GateDecision.DENY;
      }

      // Evaluación 3: El kill-switch global no está activo
      const killSwitchState = await this.validateKillSwitch();
      if (!killSwitchState) {
        return GateDecision.DENY;
      }

      // Todas las evaluaciones pasaron → ALLOW
      return GateDecision.ALLOW;
    } catch (error) {
      // Cualquier error → DENY (fail-closed)
      return GateDecision.DENY;
    }
  }

  /**
   * Valida que el usuario existe y es válido
   * @param userId UserID a validar
   * @returns true si el usuario existe y es válido, false en caso contrario
   */
  private async validateUser(userId: string): Promise<boolean> {
    try {
      if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
        return false;
      }

      const validationResult = await this.userValidator.validateUser(userId);
      return validationResult.isValid;
    } catch (error) {
      // Error al validar usuario → DENY (fail-closed)
      return false;
    }
  }

  /**
   * Valida que el sistema no está globalmente apagado
   * @returns true si el sistema está operativo, false si está apagado
   */
  private async validateSystemState(): Promise<boolean> {
    try {
      const systemState = await this.systemStateProvider.getSystemState();
      
      // El sistema debe estar OPERATIONAL para permitir continuar
      return systemState.operationalState === SystemOperationalState.OPERATIONAL;
    } catch (error) {
      // Error al consultar estado → DENY (fail-closed)
      return false;
    }
  }

  /**
   * Valida que el kill-switch global no está activo
   * @returns true si el kill-switch no está activo, false si está activo
   */
  private async validateKillSwitch(): Promise<boolean> {
    try {
      const killSwitchState = await this.killSwitchProvider.getKillSwitchState();
      
      // El kill-switch NO debe estar activo para permitir continuar
      return !killSwitchState.active;
    } catch (error) {
      // Error al consultar kill-switch → DENY (fail-closed)
      return false;
    }
  }
}

