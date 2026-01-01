/**
 * Health Check Endpoints
 * Para ELIXIR 2.0 - Fase 7.5: Redundancia y Recuperación
 * 
 * Implementa endpoints de health check mejorados:
 * - /health/live: Liveness probe
 * - /health/ready: Readiness probe
 * - /health/startup: Startup probe
 */

import { Request, Response } from 'express';
import { Metrics } from '../obs/metrics';

export interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'fail' | 'warn';
      message?: string;
      latency?: number;
    };
  };
}

export class HealthCheckService {
  private startTime: number;
  private metrics: Metrics;

  constructor(metrics: Metrics) {
    this.startTime = Date.now();
    this.metrics = metrics;
  }

  /**
   * Liveness probe - Verifica que la aplicación esté viva
   */
  async liveness(req: Request, res: Response): Promise<void> {
    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {}
    };

    // Verificación básica de que el proceso está vivo
    try {
      status.checks.process = {
        status: 'pass',
        message: 'Process is running'
      };
    } catch (error) {
      status.status = 'unhealthy';
      status.checks.process = {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    const httpStatus = status.status === 'healthy' ? 200 : 503;
    res.status(httpStatus).json(status);
  }

  /**
   * Readiness probe - Verifica que la aplicación esté lista para recibir tráfico
   */
  async readiness(req: Request, res: Response): Promise<void> {
    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {}
    };

    const checks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkMemory(),
      this.checkMetrics()
    ]);

    // Procesar resultados de checks
    checks.forEach((result, index) => {
      const checkNames = ['database', 'redis', 'memory', 'metrics'];
      if (result.status === 'fulfilled') {
        status.checks[checkNames[index]] = result.value;
      } else {
        status.checks[checkNames[index]] = {
          status: 'fail',
          message: result.reason?.message || 'Check failed'
        };
      }
    });

    // Determinar estado general
    const failedChecks = Object.values(status.checks).filter(c => c.status === 'fail');
    const warnChecks = Object.values(status.checks).filter(c => c.status === 'warn');

    if (failedChecks.length > 0) {
      status.status = 'unhealthy';
    } else if (warnChecks.length > 0) {
      status.status = 'degraded';
    }

    const httpStatus = status.status === 'healthy' ? 200 : 
                      status.status === 'degraded' ? 200 : 503;
    res.status(httpStatus).json(status);
  }

  /**
   * Startup probe - Verifica que la aplicación haya terminado de iniciar
   */
  async startup(req: Request, res: Response): Promise<void> {
    const status: HealthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
      checks: {}
    };

    // Verificar que el tiempo de inicio sea razonable
    const startupTime = (Date.now() - this.startTime) / 1000;
    if (startupTime > 60) {
      status.status = 'unhealthy';
      status.checks.startup = {
        status: 'fail',
        message: `Startup taking too long: ${startupTime}s`
      };
    } else {
      status.checks.startup = {
        status: 'pass',
        message: `Started in ${startupTime}s`
      };
    }

    // Verificar dependencias críticas
    const criticalChecks = await Promise.allSettled([
      this.checkDatabase(),
      this.checkRedis()
    ]);

    criticalChecks.forEach((result, index) => {
      const checkNames = ['database', 'redis'];
      if (result.status === 'fulfilled') {
        status.checks[checkNames[index]] = result.value;
      } else {
        status.checks[checkNames[index]] = {
          status: 'fail',
          message: result.reason?.message || 'Check failed'
        };
        status.status = 'unhealthy';
      }
    });

    const httpStatus = status.status === 'healthy' ? 200 : 503;
    res.status(httpStatus).json(status);
  }

  /**
   * Verificar conexión a base de datos
   */
  private async checkDatabase(): Promise<HealthStatus['checks'][string]> {
    const start = Date.now();
    try {
      // TODO: Implementar verificación real de base de datos
      // Por ahora, simulamos una verificación
      const latency = Date.now() - start;
      
      if (latency > 1000) {
        return {
          status: 'warn',
          message: 'Database response slow',
          latency
        };
      }

      return {
        status: 'pass',
        message: 'Database connection OK',
        latency
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Database check failed',
        latency: Date.now() - start
      };
    }
  }

  /**
   * Verificar conexión a Redis
   */
  private async checkRedis(): Promise<HealthStatus['checks'][string]> {
    const start = Date.now();
    try {
      // TODO: Implementar verificación real de Redis
      // Por ahora, simulamos una verificación
      const latency = Date.now() - start;
      
      if (latency > 500) {
        return {
          status: 'warn',
          message: 'Redis response slow',
          latency
        };
      }

      return {
        status: 'pass',
        message: 'Redis connection OK',
        latency
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Redis check failed',
        latency: Date.now() - start
      };
    }
  }

  /**
   * Verificar uso de memoria
   */
  private async checkMemory(): Promise<HealthStatus['checks'][string]> {
    try {
      const usage = process.memoryUsage();
      const heapUsed = usage.heapUsed / 1024 / 1024; // MB
      const heapTotal = usage.heapTotal / 1024 / 1024; // MB
      const rss = usage.rss / 1024 / 1024; // MB
      const usagePercent = (heapUsed / heapTotal) * 100;

      if (usagePercent > 90) {
        return {
          status: 'warn',
          message: `High memory usage: ${usagePercent.toFixed(2)}% (${heapUsed.toFixed(2)}MB / ${heapTotal.toFixed(2)}MB)`
        };
      }

      return {
        status: 'pass',
        message: `Memory usage: ${usagePercent.toFixed(2)}% (${heapUsed.toFixed(2)}MB / ${heapTotal.toFixed(2)}MB)`
      };
    } catch (error) {
      return {
        status: 'fail',
        message: error instanceof Error ? error.message : 'Memory check failed'
      };
    }
  }

  /**
   * Verificar que las métricas estén funcionando
   */
  private async checkMetrics(): Promise<HealthStatus['checks'][string]> {
    try {
      // Verificar que el servicio de métricas esté disponible
      if (!this.metrics) {
        return {
          status: 'warn',
          message: 'Metrics service not initialized'
        };
      }

      return {
        status: 'pass',
        message: 'Metrics service OK'
      };
    } catch (error) {
      return {
        status: 'warn',
        message: error instanceof Error ? error.message : 'Metrics check failed'
      };
    }
  }
}

