/**
 * Punto de entrada del servicio WAM
 * Servicio HTTP request-driven para resolución de handoffs
 */

import express, { Request, Response } from 'express';
import { InMemoryTempStore } from './storage/InMemoryTempStore';
import { NoopSender } from './sender/NoopSender';
import { TwilioSender } from './sender/TwilioSender';
import { PersistentKillSwitch } from './killswitch/PersistentKillSwitch';
import { ConsoleObservability } from './observability/ConsoleObservability';
import { HandoffResolverImpl } from './resolver/HandoffResolverImpl';
import { HandoffService } from './service/HandoffService';
import { adminAuthMiddleware } from './middleware/adminAuth';
import { ISender } from './contracts/Sender';
import { 
  handoffResolutionRateLimit, 
  handoffCreationRateLimit, 
  adminRateLimit 
} from './middleware/rateLimiter';
import { validateTwilioSignature } from './webhooks/twilioSignatureValidator';
import { OperationalLimits } from './guardrails/OperationalLimits';

const app = express();
app.use(express.json());

// Configurar trust proxy para obtener IP real (necesario para rate limiting)
app.set('trust proxy', 1);

const PORT = process.env.PORT || 3002;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;

// Inicializar componentes
const tempStore = new InMemoryTempStore();
const killSwitch = new PersistentKillSwitch();
const observability = new ConsoleObservability();

// Seleccionar sender según configuración
const provider = process.env.WAM_PROVIDER || 'noop';
const senderEnabled = process.env.WAM_SENDER_ENABLED === 'true';
let sender: ISender;

if (provider === 'twilio' && senderEnabled) {
  sender = new TwilioSender(killSwitch, observability);
} else {
  sender = new NoopSender();
}

const resolver = new HandoffResolverImpl(tempStore, sender, killSwitch, observability);
const handoffService = new HandoffService(tempStore, observability, BASE_URL);
const operationalLimits = new OperationalLimits(killSwitch, observability);

// Endpoint: Resolver handoff (GET /resolve/:handoff_id)
// Rate limiting: 10 por minuto por IP
app.get('/resolve/:handoff_id', handoffResolutionRateLimit, async (req: Request, res: Response) => {
  const { handoff_id } = req.params;

  try {
    // Verificar límites operativos antes de procesar
    const limitCheck = await operationalLimits.canProcessHandoff(handoff_id);
    if (!limitCheck.allowed) {
      observability.recordEvent({
        type: 'handoff_resolution_failed',
        handoff_id,
        timestamp: new Date().toISOString(),
        error_type: 'limit_exceeded',
        cause: limitCheck.reason || 'Límite operativo excedido'
      });
      
      return res.status(429).json({ 
        message: 'Servicio temporalmente no disponible' 
      });
    }

    // Registrar inicio de procesamiento
    operationalLimits.recordHandoffStart(handoff_id);

    const result = await resolver.resolve(handoff_id);
    
    // Registrar resultado
    if (result.success) {
      operationalLimits.recordSuccess(handoff_id);
    } else {
      operationalLimits.recordFailure(handoff_id);
    }
    
    if (result.success) {
      res.status(200).json({ message: result.message });
    } else {
      // Mensajes genéricos - no exponen causa específica
      res.status(400).json({ message: result.message });
    }
  } catch (error) {
    // Fail-closed: cualquier error resulta en rechazo
    observability.recordEvent({
      type: 'handoff_resolution_failed',
      handoff_id,
      timestamp: new Date().toISOString(),
      error_type: 'storage_error',
      cause: `Error inesperado: ${error}`
    });
    
    res.status(500).json({ 
      message: 'No se pudo completar la conexión. Por favor, intenta nuevamente.' 
    });
  }
});

// Endpoint: Crear handoff (POST /handoffs)
// Llamado desde el Chat para crear handoffs autorizados
// Rate limiting: 5 por minuto por session_id
app.post('/handoffs', handoffCreationRateLimit, async (req: Request, res: Response) => {
  try {
    const request = req.body as { session_id: string; user_ref: string; model_ref: string };

    // Validar campos requeridos
    if (!request.session_id || !request.user_ref || !request.model_ref) {
      return res.status(400).json({ 
        message: 'Campos requeridos: session_id, user_ref, model_ref' 
      });
    }

    const result = await handoffService.createHandoff(request);
    
    res.status(201).json(result);
  } catch (error) {
    observability.recordEvent({
      type: 'handoff_resolution_failed',
      timestamp: new Date().toISOString(),
      error_type: 'storage_error',
      cause: `Error al crear handoff: ${error}`
    });
    
    res.status(500).json({ 
      message: 'No se pudo crear el handoff. Por favor, intenta nuevamente.' 
    });
  }
});

// Endpoint: Health check (GET /health)
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Endpoint: Webhook Twilio Status (POST /webhooks/twilio/status)
// Recibe notificaciones de estado de mensajes de Twilio
app.post('/webhooks/twilio/status', express.urlencoded({ extended: true }), async (req: Request, res: Response) => {
  try {
    // 1. Validar firma HMAC (si está configurada)
    const authToken = process.env.TWILIO_AUTH_TOKEN || process.env.WAM_WEBHOOK_SECRET;
    const signature = req.headers['x-twilio-signature'] as string;

    if (authToken && signature) {
      const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
      const params = req.body as Record<string, string>;
      
      if (!validateTwilioSignature(authToken, url, params, signature)) {
        observability.recordEvent({
          type: 'webhook_validation_failed',
          timestamp: new Date().toISOString(),
          error_type: 'invalid_signature',
          cause: 'Firma HMAC inválida'
        });
        
        // Fail-closed: rechazar webhook
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    // 2. Validar formato básico del payload
    const messageSid = req.body.MessageSid;
    const messageStatus = req.body.MessageStatus;
    const timestamp = req.body.Timestamp || new Date().toISOString();

    if (!messageSid || !messageStatus) {
      observability.recordEvent({
        type: 'webhook_validation_failed',
        timestamp: new Date().toISOString(),
        error_type: 'invalid_payload',
        cause: 'Campos requeridos faltantes'
      });
      
      // Fail-closed: rechazar webhook
      return res.status(400).json({ message: 'Bad Request' });
    }

    // 3. Validar valores de estado conocidos
    const validStatuses = ['queued', 'sent', 'delivered', 'failed', 'undelivered'];
    if (!validStatuses.includes(messageStatus)) {
      observability.recordEvent({
        type: 'webhook_validation_failed',
        timestamp: new Date().toISOString(),
        error_type: 'invalid_payload',
        cause: `Estado inválido: ${messageStatus}`
      });
      
      // Fail-closed: rechazar webhook
      return res.status(400).json({ message: 'Bad Request' });
    }

    // 4. Registrar evento agregado (SIN PII ni contenido)
    observability.recordEvent({
      type: 'provider_webhook_received',
      timestamp,
      // NO registrar messageSid completo si puede contener PII
      // Solo registrar estado agregado
    });

    // 5. Registrar métricas agregadas
    if (messageStatus === 'delivered') {
      observability.recordMetric({
        name: 'status_delivered_total',
        value: 1,
        timestamp,
        tags: { provider: 'twilio' }
      });
    } else if (messageStatus === 'failed' || messageStatus === 'undelivered') {
      observability.recordMetric({
        name: 'status_failed_total',
        value: 1,
        timestamp,
        tags: { provider: 'twilio', status: messageStatus }
      });
    }

    // 6. Responder 200/ACK genérico (sin datos)
    res.status(200).json({ message: 'OK' });

  } catch (error) {
    // Fail-closed: cualquier error resulta en rechazo
    observability.recordEvent({
      type: 'webhook_validation_failed',
      timestamp: new Date().toISOString(),
      error_type: 'parse_error',
      cause: `Error al procesar webhook: ${error}`
    });
    
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Endpoint: Kill-switch (POST /admin/killswitch)
// Protegido con autenticación y rate limiting
app.post('/admin/killswitch', adminRateLimit, adminAuthMiddleware, async (req: Request, res: Response) => {
  try {
    const { action, mode } = req.body as { action: 'activate' | 'deactivate'; mode?: 'DROP' | 'SILENCIO' };

    if (action === 'activate') {
      if (!mode || (mode !== 'DROP' && mode !== 'SILENCIO')) {
        return res.status(400).json({ message: 'Modo requerido: DROP o SILENCIO' });
      }

      const result = await killSwitch.activate(mode);
      
      if (result.success) {
        observability.recordEvent({
          type: 'kill_switch_activated',
          timestamp: new Date().toISOString()
        });
        
        res.status(200).json({ message: 'Kill-switch activado', mode });
      } else {
        res.status(500).json({ message: result.error });
      }
    } else if (action === 'deactivate') {
      const result = await killSwitch.deactivate();
      
      if (result.success) {
        observability.recordEvent({
          type: 'kill_switch_deactivated',
          timestamp: new Date().toISOString()
        });
        
        res.status(200).json({ message: 'Kill-switch desactivado' });
      } else {
        res.status(500).json({ message: result.error });
      }
    } else {
      res.status(400).json({ message: 'Acción requerida: activate o deactivate' });
    }
  } catch (error) {
    res.status(500).json({ message: `Error: ${error}` });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`[WAM] Servicio iniciado en puerto ${PORT}`);
  console.log(`[WAM] Base URL: ${BASE_URL}`);
  console.log(`[WAM] Provider: ${provider} (enabled: ${senderEnabled})`);
  console.log(`[WAM] Modo: ${provider === 'twilio' && senderEnabled ? 'GO CONTROLADO (Twilio)' : 'DEV (in-memory, sender simulado)'}`);
});

