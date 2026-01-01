/**
 * Módulo de Cache - Exporta todas las funcionalidades de caching
 */

export { RedisCache, getCache, CacheOptions } from './RedisCache';
export { cacheMiddleware, invalidateCache, CacheMiddlewareOptions } from './CacheMiddleware';

