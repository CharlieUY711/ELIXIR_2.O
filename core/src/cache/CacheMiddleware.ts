/**
 * Middleware de Express para caching automático de respuestas HTTP
 * Reduce la carga en los servicios cacheando respuestas exitosas
 */

import { Request, Response, NextFunction } from 'express';
import { RedisCache, getCache } from './RedisCache';

export interface CacheMiddlewareOptions {
  ttl?: number; // Tiempo de vida del cache en segundos
  prefix?: string; // Prefijo para las claves
  includeQuery?: boolean; // Incluir query params en la clave
  includeHeaders?: string[]; // Headers a incluir en la clave
  skipCache?: (req: Request) => boolean; // Función para saltar el cache
  onlyMethods?: string[]; // Solo cachear estos métodos HTTP
}

/**
 * Genera una clave de cache basada en la request
 */
function generateCacheKey(
  req: Request,
  options: CacheMiddlewareOptions
): string {
  const parts: string[] = [];

  if (options.prefix) {
    parts.push(options.prefix);
  }

  parts.push(req.method);
  parts.push(req.path);

  if (options.includeQuery && Object.keys(req.query).length > 0) {
    const queryString = new URLSearchParams(
      req.query as Record<string, string>
    ).toString();
    parts.push(queryString);
  }

  if (options.includeHeaders && options.includeHeaders.length > 0) {
    const headerValues = options.includeHeaders
      .map(header => req.headers[header.toLowerCase()])
      .filter(Boolean)
      .join(':');
    if (headerValues) {
      parts.push(headerValues);
    }
  }

  return parts.join(':');
}

/**
 * Middleware de cache para Express
 */
export function cacheMiddleware(options: CacheMiddlewareOptions = {}) {
  const cache = getCache();
  const defaultTTL = options.ttl || 300; // 5 minutos por defecto
  const onlyMethods = options.onlyMethods || ['GET'];

  return async (req: Request, res: Response, next: NextFunction) => {
    // Solo cachear métodos especificados
    if (!onlyMethods.includes(req.method)) {
      return next();
    }

    // Verificar si se debe saltar el cache
    if (options.skipCache && options.skipCache(req)) {
      return next();
    }

    const cacheKey = generateCacheKey(req, options);

    try {
      // Intentar obtener del cache
      const cached = await cache.get<{
        status: number;
        headers: Record<string, string>;
        body: any;
      }>(cacheKey);

      if (cached) {
        // Enviar respuesta desde cache
        res.set(cached.headers);
        return res.status(cached.status).json(cached.body);
      }

      // Interceptar la respuesta para cachearla
      const originalJson = res.json.bind(res);
      res.json = function (body: any) {
        // Solo cachear respuestas exitosas
        if (res.statusCode >= 200 && res.statusCode < 300) {
          cache.set(
            cacheKey,
            {
              status: res.statusCode,
              headers: res.getHeaders() as Record<string, string>,
              body,
            },
            { ttl: defaultTTL }
          ).catch(err => {
            console.error('Error cacheando respuesta:', err);
          });
        }

        return originalJson(body);
      };

      next();
    } catch (error) {
      console.error('Error en cache middleware:', error);
      // Continuar sin cache si hay error
      next();
    }
  };
}

/**
 * Middleware para invalidar cache basado en patrones
 */
export function invalidateCache(pattern: string) {
  const cache = getCache();

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await cache.deletePattern(pattern);
      next();
    } catch (error) {
      console.error('Error invalidando cache:', error);
      next();
    }
  };
}

