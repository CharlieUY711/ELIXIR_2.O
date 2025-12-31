/**
 * Implementación del Handoff Resolver
 * Valida y resuelve handoffs con uso único atómico
 */

import { IHandoffResolver, ResolutionResult, ResolutionErrorType } from '../contracts/HandoffResolver';
import { ITempStore, GetResult } from '../contracts/TempStore';
import { ISender, SendResult } from '../contracts/Sender';
import { IKillSwitch } from '../contracts/KillSwitch';
import { IObservability } from '../contracts/Observability';

export class HandoffResolverImpl implements IHandoffResolver {
  private readonly STORAGE_TIMEOUT_MS = 2000; // 2 segundos
  private readonly TOTAL_TIMEOUT_MS = 15000; // 15 segundos

  constructor(
    private tempStore: ITempStore,
    private sender: ISender,
    private killSwitch: IKillSwitch,
    private observability: IObservability
  ) {}

  async resolve(handoff_id: string): Promise<ResolutionResult> {
    const startTime = Date.now();

    try {
      // 1. Verificar kill-switch
      const killSwitchState = await this.killSwitch.isActive();
      if (killSwitchState.active) {
        if (killSwitchState.mode === 'DROP') {
          this.observability.recordEvent({
            type: 'handoff_resolution_failed',
            handoff_id,
            timestamp: new Date().toISOString(),
            error_type: 'kill_switch_active',
            cause: 'Kill-switch activo en modo DROP'
          });
          
          return {
            success: false,
            message: 'Servicio temporalmente no disponible',
            error_type: 'kill_switch_active'
          };
        }
        // Modo SILENCIO: procesar pero no ejecutar sender
      }

      // 2. Validar formato de handoff_id (UUID v4 básico)
      if (!this.isValidHandoffId(handoff_id)) {
        this.observability.recordEvent({
          type: 'handoff_resolution_failed',
          handoff_id,
          timestamp: new Date().toISOString(),
          error_type: 'invalid_handoff_id'
        });
        
        return {
          success: false,
          message: 'Enlace inválido',
          error_type: 'invalid_handoff_id'
        };
      }

      // 3. Consultar almacenamiento con timeout
      const handoffResult = await Promise.race([
        this.tempStore.get(handoff_id),
        this.timeoutPromise<GetResult>(this.STORAGE_TIMEOUT_MS, {
          error: {
            type: 'timeout' as const,
            message: 'Timeout al consultar almacenamiento'
          }
        })
      ]);

      if (handoffResult.error || !handoffResult.handoff) {
        const errorType = handoffResult.error?.type === 'timeout' 
          ? 'storage_timeout' 
          : 'handoff_not_found';
        
        this.observability.recordEvent({
          type: 'handoff_resolution_failed',
          handoff_id,
          timestamp: new Date().toISOString(),
          error_type: errorType
        });
        
        return {
          success: false,
          message: 'Enlace inválido',
          error_type: errorType as ResolutionErrorType
        };
      }

      const handoff = handoffResult.handoff;

      // 4. Verificar estado
      if (handoff.status === 'REDEEMED') {
        this.observability.recordEvent({
          type: 'handoff_resolution_failed',
          handoff_id,
          timestamp: new Date().toISOString(),
          error_type: 'handoff_already_redeemed'
        });
        
        return {
          success: false,
          message: 'Este enlace ya ha sido utilizado',
          error_type: 'handoff_already_redeemed'
        };
      }

      if (handoff.status === 'EXPIRED' || handoff.status === 'REVOKED') {
        this.observability.recordEvent({
          type: 'handoff_resolution_failed',
          handoff_id,
          timestamp: new Date().toISOString(),
          error_type: handoff.status === 'EXPIRED' ? 'handoff_expired' : 'handoff_not_found'
        });
        
        return {
          success: false,
          message: handoff.status === 'EXPIRED' 
            ? 'Este enlace ha expirado. Por favor, inicia nuevamente'
            : 'Enlace inválido',
          error_type: handoff.status === 'EXPIRED' ? 'handoff_expired' : 'handoff_not_found'
        };
      }

      // 5. Verificar TTL
      const now = Date.now();
      const expiresAt = new Date(handoff.expires_at).getTime();
      
      if (now >= expiresAt) {
        // Marcar como expirado
        await this.tempStore.expire(handoff_id);
        
        this.observability.recordEvent({
          type: 'handoff_expired',
          handoff_id,
          timestamp: new Date().toISOString(),
          cause: 'TTL vencido'
        });
        
        return {
          success: false,
          message: 'Este enlace ha expirado. Por favor, inicia nuevamente',
          error_type: 'handoff_expired'
        };
      }

      // 6. Transición atómica CREATED → REDEEMED
      const updateResult = await this.tempStore.update(handoff_id, 'REDEEMED');
      
      if (!updateResult.success) {
        this.observability.recordEvent({
          type: 'handoff_resolution_failed',
          handoff_id,
          timestamp: new Date().toISOString(),
          error_type: 'storage_error'
        });
        
        return {
          success: false,
          message: 'No se pudo completar la conexión. Por favor, intenta nuevamente.',
          error_type: 'storage_error'
        };
      }

      // 7. Registrar evento de resolución exitosa
      this.observability.recordEvent({
        type: 'handoff_redeemed',
        handoff_id,
        session_id: handoff.session_id,
        timestamp: new Date().toISOString()
      });

      // 8. Ejecutar Sender (solo si kill-switch no está en modo SILENCIO)
      if (!killSwitchState.active || killSwitchState.mode !== 'SILENCIO') {
        const sendResult = await Promise.race([
          this.sender.send({
            handoff_id,
            user_ref: handoff.user_ref,
            model_ref: handoff.model_ref
          }),
          this.timeoutPromise<SendResult>(10000, {
            success: false,
            timestamp: new Date().toISOString(),
            error_type: 'provider_timeout'
          })
        ]);

        if (sendResult.success) {
          this.observability.recordEvent({
            type: 'provider_execution_success',
            handoff_id,
            timestamp: new Date().toISOString()
          });
        } else {
          this.observability.recordEvent({
            type: 'provider_execution_failed',
            handoff_id,
            timestamp: new Date().toISOString(),
            error_type: sendResult.error_type
          });
        }
      }

      // 9. Retornar éxito
      const duration = Date.now() - startTime;
      this.observability.recordMetric({
        name: 'handoff_resolution_duration_ms',
        value: duration,
        timestamp: new Date().toISOString()
      });

      return {
        success: true,
        message: 'Redirigiendo a WhatsApp...'
      };

    } catch (error) {
      // Fail-closed: cualquier error resulta en rechazo
      this.observability.recordEvent({
        type: 'handoff_resolution_failed',
        handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'storage_error',
        cause: `Error inesperado: ${error}`
      });
      
      return {
        success: false,
        message: 'No se pudo completar la conexión. Por favor, intenta nuevamente.',
        error_type: 'storage_error'
      };
    }
  }

  private isValidHandoffId(handoff_id: string): boolean {
    // Validación básica de UUID v4 (8-4-4-4-12)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(handoff_id);
  }

  private timeoutPromise<T>(ms: number, defaultValue: T): Promise<T> {
    return new Promise(resolve => {
      setTimeout(() => resolve(defaultValue), ms);
    });
  }
}

