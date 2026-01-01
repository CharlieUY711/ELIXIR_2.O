/**
 * ClusterManager - Gestor de clustering para Node.js
 * Permite que los servicios escalen horizontalmente usando múltiples workers
 */

import * as cluster from 'cluster';
import * as os from 'os';

export interface ClusterConfig {
  workerCount?: number;
  restartOnFailure?: boolean;
  maxRestarts?: number;
  restartDelay?: number;
}

export class ClusterManager {
  private config: Required<ClusterConfig>;
  private workerRestarts: Map<number, number> = new Map();
  private isShuttingDown: boolean = false;

  constructor(config: ClusterConfig = {}) {
    this.config = {
      workerCount: process.env.WORKER_COUNT 
        ? parseInt(process.env.WORKER_COUNT, 10) 
        : os.cpus().length,
      restartOnFailure: true,
      maxRestarts: 10,
      restartDelay: 1000,
      ...config,
    };
  }

  /**
   * Inicia el cluster en modo master
   */
  start(workerCallback: () => void): void {
    if (cluster.isPrimary || cluster.isMaster) {
      this.startMaster();
    } else {
      // Ejecutar el código del worker
      workerCallback();
    }
  }

  /**
   * Inicia el proceso master
   */
  private startMaster(): void {
    console.log(`Master process ${process.pid} is starting`);
    console.log(`Starting ${this.config.workerCount} workers`);

    // Crear workers
    for (let i = 0; i < this.config.workerCount; i++) {
      this.createWorker();
    }

    // Manejar eventos de workers
    cluster.on('exit', (worker, code, signal) => {
      const pid = worker.process.pid;
      console.log(`Worker ${pid} died (code: ${code}, signal: ${signal})`);

      if (!this.isShuttingDown && this.config.restartOnFailure) {
        const restarts = this.workerRestarts.get(worker.id) || 0;
        
        if (restarts < this.config.maxRestarts) {
          console.log(`Restarting worker ${worker.id} (restart count: ${restarts + 1})`);
          this.workerRestarts.set(worker.id, restarts + 1);
          
          setTimeout(() => {
            this.createWorker();
          }, this.config.restartDelay);
        } else {
          console.error(`Worker ${worker.id} exceeded max restarts (${this.config.maxRestarts})`);
        }
      }
    });

    // Manejar señales de terminación
    process.on('SIGTERM', () => this.shutdown());
    process.on('SIGINT', () => this.shutdown());

    // Logging de workers
    cluster.on('online', (worker) => {
      console.log(`Worker ${worker.process.pid} is online`);
      this.workerRestarts.set(worker.id, 0);
    });

    // Balanceo de carga entre workers
    this.setupLoadBalancing();
  }

  /**
   * Crea un nuevo worker
   */
  private createWorker(): cluster.Worker {
    const worker = cluster.fork();
    
    // Enviar configuración al worker
    worker.send({
      type: 'config',
      workerId: worker.id,
      workerCount: this.config.workerCount,
    });

    return worker;
  }

  /**
   * Configura el balanceo de carga entre workers
   */
  private setupLoadBalancing(): void {
    // Round-robin por defecto en Node.js cluster
    // Se puede personalizar aquí si es necesario
    console.log('Load balancing configured (round-robin)');
  }

  /**
   * Apaga el cluster de manera controlada
   */
  private shutdown(): void {
    console.log('Shutting down cluster...');
    this.isShuttingDown = true;

    const workers = Object.values(cluster.workers || {});
    
    // Cerrar workers de manera controlada
    workers.forEach((worker) => {
      if (worker) {
        worker.kill('SIGTERM');
      }
    });

    // Forzar cierre después de un timeout
    setTimeout(() => {
      console.log('Force closing cluster');
      process.exit(0);
    }, 10000);
  }

  /**
   * Obtiene estadísticas del cluster
   */
  getStats(): {
    masterPid: number;
    workerCount: number;
    workers: Array<{
      id: number;
      pid: number;
      state: string;
      restarts: number;
    }>;
  } {
    const workers = Object.values(cluster.workers || {});
    
    return {
      masterPid: process.pid,
      workerCount: workers.length,
      workers: workers.map((worker) => ({
        id: worker?.id || 0,
        pid: worker?.process.pid || 0,
        state: worker?.state || 'unknown',
        restarts: this.workerRestarts.get(worker?.id || 0) || 0,
      })),
    };
  }

  /**
   * Verifica si el proceso actual es el master
   */
  isMaster(): boolean {
    return cluster.isPrimary || cluster.isMaster;
  }

  /**
   * Obtiene el ID del worker actual
   */
  getWorkerId(): number | undefined {
    if (cluster.worker) {
      return cluster.worker.id;
    }
    return undefined;
  }
}

/**
 * Factory para crear instancias de ClusterManager
 */
export function createClusterManager(config?: ClusterConfig): ClusterManager {
  return new ClusterManager(config);
}

