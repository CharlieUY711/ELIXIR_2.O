/**
 * Rate Limiter básico para protección contra flood
 * Implementación simple in-memory con ventana deslizante
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyExtractor: (req: Request) => string;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpiar entradas expiradas cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  middleware(config: RateLimitConfig) {
    return (req: Request, res: Response, next: NextFunction): void => {
      const key = config.keyExtractor(req);
      const now = Date.now();

      // Obtener o crear entrada
      let entry = this.store.get(key);
      
      if (!entry || now >= entry.resetAt) {
        // Nueva ventana
        entry = {
          count: 1,
          resetAt: now + config.windowMs
        };
        this.store.set(key, entry);
        next();
        return;
      }

      // Incrementar contador
      entry.count++;

      if (entry.count > config.maxRequests) {
        // Límite excedido
        res.status(429).json({ 
          message: 'Demasiadas solicitudes. Por favor, intenta nuevamente más tarde.' 
        });
        return;
      }

      next();
    };
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetAt) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Instancia global del rate limiter
const rateLimiter = new RateLimiter();

/**
 * Rate limiter para resoluciones de handoff por IP
 * Límite: 10 por minuto
 */
export function handoffResolutionRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  rateLimiter.middleware({
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
    keyExtractor: () => `handoff_resolution:${ip}`
  })(req, res, next);
}

/**
 * Rate limiter para creación de handoffs por session_id
 * Límite: 5 por minuto
 */
export function handoffCreationRateLimit(req: Request, res: Response, next: NextFunction): void {
  const sessionId = (req.body as { session_id?: string })?.session_id || 'unknown';
  
  rateLimiter.middleware({
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minuto
    keyExtractor: () => `handoff_creation:${sessionId}`
  })(req, res, next);
}

/**
 * Rate limiter para endpoint admin (por IP)
 * Límite: 5 por minuto
 */
export function adminRateLimit(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  
  rateLimiter.middleware({
    maxRequests: 5,
    windowMs: 60 * 1000, // 1 minuto
    keyExtractor: () => `admin:${ip}`
  })(req, res, next);
}

