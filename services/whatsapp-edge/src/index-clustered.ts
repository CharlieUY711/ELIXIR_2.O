/**
 * Punto de entrada del servicio WAM con clustering
 * Ejemplo de integración del ClusterManager para escalabilidad horizontal
 */

import express, { Request, Response } from 'express';
import { createClusterManager } from '../../../core/src/cluster/ClusterManager';

// Importar componentes del servicio original
import { InMemoryTempStore } from './storage/InMemoryTempStore';
import { HandoffService } from './service/HandoffService';
import { HandoffResolverImpl } from './resolver/HandoffResolverImpl';
import { NoopSender } from './sender/NoopSender';
import { TwilioSender } from './sender/TwilioSender';
import { PersistentKillSwitch } from './killswitch/PersistentKillSwitch';
import { ConsoleObservability } from './observability/ConsoleObservability';
import { adminAuthMiddleware } from './middleware/adminAuth';
import { ISender } from './contracts/Sender';
import { 
  handoffResolutionRateLimit, 
  handoffCreationRateLimit, 
  adminRateLimit 
} from './middleware/rateLimiter';
import { validateTwilioSignature } from './webhooks/twilioSignatureValidator';
import { OperationalLimits } from './guardrails/OperationalLimits';

const PORT = process.env.PORT || 3002;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const CLUSTER_MODE = process.env.CLUSTER_MODE === 'true';

/**
 * Función que crea y configura el servidor Express
 */
function createServer(): express.Application {
  const app = express();
  app.use(express.json());
  app.set('trust proxy', 1);

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
  const operationalLimits = new OperationalLimits();

  // Endpoints
  app.get('/health', (req: Request, res: Response) => {
    const clusterInfo = CLUSTER_MODE ? {
      workerId: process.env.WORKER_ID,
      isMaster: false,
    } : {};
    
    res.json({
      status: 'healthy',
      service: 'whatsapp-edge',
      timestamp: new Date().toISOString(),
      ...clusterInfo,
    });
  });

  app.get('/health/cluster', (req: Request, res: Response) => {
    // Este endpoint solo funciona si hay un cluster manager
    res.json({
      message: 'Cluster info available via cluster manager',
    });
  });

  // Endpoints del servicio (simplificados para el ejemplo)
  app.post('/api/handoff', handoffCreationRateLimit, async (req: Request, res: Response) => {
    // Implementación del endpoint
    res.json({ message: 'Handoff created' });
  });

  app.post('/api/handoff/resolve', handoffResolutionRateLimit, async (req: Request, res: Response) => {
    // Implementación del endpoint
    res.json({ message: 'Handoff resolved' });
  });

  // Endpoint de administración
  app.get('/admin/stats', adminAuthMiddleware, adminRateLimit, (req: Request, res: Response) => {
    res.json({
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      workerId: process.env.WORKER_ID,
    });
  });

  return app;
}

/**
 * Inicia el servidor
 */
function startServer(): void {
  const app = createServer();
  const server = app.listen(PORT, () => {
    const workerId = process.env.WORKER_ID || 'single';
    console.log(`WhatsApp Edge service running on port ${PORT} (Worker: ${workerId})`);
    console.log(`Cluster mode: ${CLUSTER_MODE}`);
  });

  // Manejo de cierre graceful
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

/**
 * Punto de entrada principal
 */
if (CLUSTER_MODE) {
  // Modo cluster
  const cluster = createClusterManager({
    workerCount: parseInt(process.env.WORKER_COUNT || '2'),
    restartOnFailure: true,
    maxRestarts: 10,
    restartDelay: 1000,
  });

  cluster.start(() => {
    // Este código se ejecuta en cada worker
    const workerId = cluster.getWorkerId();
    process.env.WORKER_ID = workerId?.toString() || 'unknown';
    startServer();
  });
} else {
  // Modo single process
  process.env.WORKER_ID = 'single';
  startServer();
}

