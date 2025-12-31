/**
 * Implementación del Sender para Twilio WhatsApp Business API
 * GO CONTROLADO - Integración mínima
 */

import { ISender, SendRequest, SendResult, SendErrorType } from '../contracts/Sender';
import { IKillSwitch } from '../contracts/KillSwitch';
import { IObservability } from '../contracts/Observability';
import twilio from 'twilio';

export class TwilioSender implements ISender {
  private readonly client: twilio.Twilio | null;
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly whatsappFrom: string;
  private readonly timeoutMs: number;
  private readonly enabled: boolean;
  private readonly killSwitch: IKillSwitch;
  private readonly observability: IObservability;

  constructor(
    killSwitch: IKillSwitch,
    observability: IObservability
  ) {
    this.killSwitch = killSwitch;
    this.observability = observability;
    
    // Leer configuración de variables de entorno
    this.accountSid = process.env.TWILIO_ACCOUNT_SID || '';
    this.authToken = process.env.TWILIO_AUTH_TOKEN || '';
    this.whatsappFrom = process.env.TWILIO_WHATSAPP_FROM || '';
    this.timeoutMs = parseInt(process.env.PROVIDER_TIMEOUT_MS || '10000', 10);
    this.enabled = process.env.WAM_SENDER_ENABLED === 'true';

    // Inicializar cliente Twilio solo si está habilitado y hay credenciales
    if (this.enabled && this.accountSid && this.authToken) {
      this.client = twilio(this.accountSid, this.authToken);
    } else {
      this.client = null;
    }
  }

  async send(request: SendRequest): Promise<SendResult> {
    const startTime = Date.now();

    // 1. Verificar kill-switch (DROP/SILENCIO)
    const killSwitchState = await this.killSwitch.isActive();
    if (killSwitchState.active) {
      if (killSwitchState.mode === 'DROP') {
        this.observability.recordEvent({
          type: 'provider_execution_failed',
          handoff_id: request.handoff_id,
          timestamp: new Date().toISOString(),
          error_type: 'provider_unavailable',
          cause: 'Kill-switch activo en modo DROP'
        });
        
        return {
          success: false,
          timestamp: new Date().toISOString(),
          error_type: 'provider_unavailable'
        };
      }
      // Modo SILENCIO: no ejecutar, retornar silencio
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error_type: 'provider_unavailable'
      };
    }

    // 2. Verificar si sender está habilitado
    if (!this.enabled) {
      // Silencio: no ejecutar pero no registrar error
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error_type: 'provider_unavailable'
      };
    }

    // 3. Verificar que cliente esté inicializado
    if (!this.client) {
      this.observability.recordEvent({
        type: 'provider_execution_failed',
        handoff_id: request.handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'invalid_credentials',
        cause: 'Credenciales de Twilio no configuradas'
      });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error_type: 'invalid_credentials'
      };
    }

    // 4. Validar referencias (no deben estar vacías)
    if (!request.user_ref || !request.model_ref) {
      this.observability.recordEvent({
        type: 'provider_execution_failed',
        handoff_id: request.handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'invalid_user_ref',
        cause: 'Referencias inválidas'
      });
      
      return {
        success: false,
        timestamp: new Date().toISOString(),
        error_type: !request.user_ref ? 'invalid_user_ref' : 'invalid_model_ref'
      };
    }

    // 5. Enviar mensaje vía Twilio con timeout
    try {
      const messagePromise = this.client.messages.create({
        from: this.whatsappFrom,
        to: `whatsapp:${request.user_ref}`, // user_ref debe ser número enmascarado
        body: 'Conectando...', // Mensaje genérico, sin PII
        statusCallback: process.env.WAM_WEBHOOK_URL || undefined,
        // Idempotencia usando handoff_id
        // Nota: Twilio no soporta Idempotency-Key header directamente,
        // pero el handoff_id ya garantiza uso único
      });

      // Aplicar timeout
      const timeoutPromise = new Promise<SendResult>((resolve) => {
        setTimeout(() => {
          resolve({
            success: false,
            timestamp: new Date().toISOString(),
            error_type: 'provider_timeout'
          });
        }, this.timeoutMs);
      });

      const result = await Promise.race([messagePromise, timeoutPromise]);

      // Si es timeout, ya retornamos
      if (!('sid' in result)) {
        const latency = Date.now() - startTime;
        this.observability.recordEvent({
          type: 'provider_execution_failed',
          handoff_id: request.handoff_id,
          timestamp: new Date().toISOString(),
          error_type: 'provider_timeout',
          cause: `Timeout después de ${this.timeoutMs}ms`
        });
        
        this.observability.recordMetric({
          name: 'outbound_latency_ms',
          value: latency,
          timestamp: new Date().toISOString(),
          tags: { status: 'timeout' }
        });
        
        return result as SendResult;
      }

      // 6. Procesar respuesta de Twilio
      const twilioMessage = result as any; // Twilio MessageInstance
      const latency = Date.now() - startTime;

      // Mapear estado de Twilio a resultado
      const status = twilioMessage.status;
      const success = status === 'queued' || status === 'sent' || status === 'delivered';

      if (success) {
        this.observability.recordEvent({
          type: 'provider_execution_success',
          handoff_id: request.handoff_id,
          timestamp: new Date().toISOString()
        });
        
        this.observability.recordMetric({
          name: 'outbound_latency_ms',
          value: latency,
          timestamp: new Date().toISOString(),
          tags: { status: 'success' }
        });
      } else {
        // Mapear error según estado de Twilio
        const errorType = this.mapTwilioError(status, twilioMessage.errorCode);
        
        this.observability.recordEvent({
          type: 'provider_execution_failed',
          handoff_id: request.handoff_id,
          timestamp: new Date().toISOString(),
          error_type: errorType,
          cause: `Twilio status: ${status}`
        });
        
        this.observability.recordMetric({
          name: 'outbound_latency_ms',
          value: latency,
          timestamp: new Date().toISOString(),
          tags: { status: 'failed' }
        });
      }

      return {
        success,
        timestamp: new Date().toISOString(),
        error_type: success ? undefined : this.mapTwilioError(status, twilioMessage.errorCode)
      };

    } catch (error: any) {
      // 7. Manejar errores de Twilio
      const latency = Date.now() - startTime;
      const errorType = this.mapTwilioException(error);
      
      this.observability.recordEvent({
        type: 'provider_execution_failed',
        handoff_id: request.handoff_id,
        timestamp: new Date().toISOString(),
        error_type: errorType,
        cause: `Error de Twilio: ${error.message || error}`
      });
      
      this.observability.recordMetric({
        name: 'outbound_latency_ms',
        value: latency,
        timestamp: new Date().toISOString(),
        tags: { status: 'error' }
      });

      return {
        success: false,
        timestamp: new Date().toISOString(),
        error_type: errorType
      };
    }
  }

  /**
   * Mapea estado de Twilio a tipo de error genérico
   */
  private mapTwilioError(status: string | null, errorCode: number | null | undefined): SendErrorType {
    if (!status) {
      return 'provider_error';
    }

    // Estados de error conocidos
    if (status === 'failed') {
      if (errorCode === 21211 || errorCode === 21212) {
        return 'invalid_user_ref';
      }
      if (errorCode === 21608 || errorCode === 21610) {
        return 'invalid_credentials';
      }
      return 'provider_error';
    }

    if (status === 'undelivered') {
      return 'provider_error';
    }

    // Estados exitosos no deberían llegar aquí
    return 'provider_error';
  }

  /**
   * Mapea excepciones de Twilio a tipo de error genérico
   */
  private mapTwilioException(error: any): SendErrorType {
    // Códigos de error HTTP de Twilio
    if (error.status === 401 || error.status === 403) {
      return 'invalid_credentials';
    }

    if (error.status === 429) {
      return 'provider_error'; // Rate limit
    }

    if (error.code === 'ETIMEDOUT' || error.code === 'ECONNRESET') {
      return 'provider_timeout';
    }

    // Error genérico por defecto
    return 'provider_error';
  }
}

