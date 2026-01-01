/**
 * authorize-with-cache - Versión del servicio de autorización con caching
 * Ejemplo de integración del CacheManager para mejorar rendimiento
 */

import { AuthorizeService } from './authorize';
import { CacheManager, createCacheManager } from '../cache/CacheManager';
import { AuthorizationRequest } from '../domain/request';
import { Decision } from '../domain/decision';

export class CachedAuthorizeService {
  private authorizeService: AuthorizeService;
  private cache: CacheManager;
  private cacheEnabled: boolean;

  constructor(authorizeService: AuthorizeService, cache?: CacheManager) {
    this.authorizeService = authorizeService;
    this.cacheEnabled = cache !== undefined;
    
    if (cache) {
      this.cache = cache;
    } else if (process.env.REDIS_HOST) {
      // Crear cache si está configurado
      this.cache = createCacheManager({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
        password: process.env.REDIS_PASSWORD,
        ttl: parseInt(process.env.CACHE_TTL || '300'), // 5 minutos por defecto
        keyPrefix: 'elixir:auth:',
      });
    }
  }

  /**
   * Inicializa el cache si está habilitado
   */
  async initialize(): Promise<void> {
    if (this.cache && this.cacheEnabled) {
      await this.cache.connect();
    }
  }

  /**
   * Autoriza una petición con caching
   */
  async authorize(request: AuthorizationRequest): Promise<Decision> {
    // Generar clave de cache basada en la petición
    const cacheKey = this.generateCacheKey(request);

    // Intentar obtener del cache
    if (this.cache && this.cacheEnabled && this.cache.isConnected()) {
      const cachedDecision = await this.cache.get<Decision>(cacheKey);
      
      if (cachedDecision) {
        // Retornar decisión cacheada
        return cachedDecision;
      }
    }

    // Si no está en cache, ejecutar autorización normal
    const decision = await this.authorizeService.authorize(request);

    // Almacenar en cache solo si es ALLOW (las decisiones DENY pueden cambiar)
    if (this.cache && this.cacheEnabled && this.cache.isConnected()) {
      if (decision.result === 'ALLOW') {
        // Cachear decisiones ALLOW por más tiempo
        await this.cache.set(cacheKey, decision, 600); // 10 minutos
      } else {
        // Cachear decisiones DENY por menos tiempo
        await this.cache.set(cacheKey, decision, 60); // 1 minuto
      }
    }

    return decision;
  }

  /**
   * Invalida el cache para una petición específica
   */
  async invalidateCache(request: AuthorizationRequest): Promise<void> {
    if (this.cache && this.cacheEnabled && this.cache.isConnected()) {
      const cacheKey = this.generateCacheKey(request);
      await this.cache.delete(cacheKey);
    }
  }

  /**
   * Invalida todo el cache de autorizaciones
   */
  async invalidateAllCache(): Promise<void> {
    if (this.cache && this.cacheEnabled && this.cache.isConnected()) {
      await this.cache.deletePattern('elixir:auth:*');
    }
  }

  /**
   * Genera una clave de cache única para una petición
   */
  private generateCacheKey(request: AuthorizationRequest): string {
    // Crear clave basada en los campos relevantes de la petición
    const keyParts = [
      request.userId || 'anonymous',
      request.action || 'unknown',
      request.resource || 'unknown',
      request.context?.channel || 'default',
    ];

    return keyParts.join(':');
  }

  /**
   * Cierra las conexiones
   */
  async shutdown(): Promise<void> {
    if (this.cache && this.cacheEnabled) {
      await this.cache.disconnect();
    }
  }
}

