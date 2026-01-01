/**
 * Cliente Redis para caching y almacenamiento distribuido
 * Proporciona funciones para cachear respuestas y reducir carga en bases de datos
 */

import { createClient, RedisClientType } from 'redis';

export interface CacheOptions {
  ttl?: number; // Time to live en segundos
  prefix?: string; // Prefijo para las claves
}

export class RedisCache {
  private client: RedisClientType;
  private isConnected: boolean = false;

  constructor(
    private host: string = process.env.REDIS_HOST || 'localhost',
    private port: number = parseInt(process.env.REDIS_PORT || '6379'),
    private password?: string
  ) {
    this.client = createClient({
      socket: {
        host: this.host,
        port: this.port,
      },
      password: this.password,
      // Reintentos automáticos
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 10) {
            return new Error('Demasiados intentos de reconexión');
          }
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.client.on('error', (err) => {
      console.error('Error de Redis:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      console.log('Conectado a Redis');
      this.isConnected = true;
    });

    this.client.on('disconnect', () => {
      console.log('Desconectado de Redis');
      this.isConnected = false;
    });
  }

  /**
   * Conecta al servidor Redis
   */
  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  /**
   * Desconecta del servidor Redis
   */
  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.quit();
      this.isConnected = false;
    }
  }

  /**
   * Obtiene un valor del cache
   */
  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKey = prefix ? `${prefix}:${key}` : key;
      const value = await this.client.get(fullKey);
      
      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Error obteniendo clave ${key} de Redis:`, error);
      return null;
    }
  }

  /**
   * Establece un valor en el cache con TTL opcional
   */
  async set(
    key: string,
    value: any,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
      const serializedValue = JSON.stringify(value);

      if (options.ttl) {
        await this.client.setEx(fullKey, options.ttl, serializedValue);
      } else {
        await this.client.set(fullKey, serializedValue);
      }

      return true;
    } catch (error) {
      console.error(`Error estableciendo clave ${key} en Redis:`, error);
      return false;
    }
  }

  /**
   * Elimina una clave del cache
   */
  async delete(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKey = prefix ? `${prefix}:${key}` : key;
      await this.client.del(fullKey);
      return true;
    } catch (error) {
      console.error(`Error eliminando clave ${key} de Redis:`, error);
      return false;
    }
  }

  /**
   * Elimina todas las claves que coincidan con un patrón
   */
  async deletePattern(pattern: string): Promise<number> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const keys = await this.client.keys(pattern);
      if (keys.length === 0) {
        return 0;
      }

      return await this.client.del(keys);
    } catch (error) {
      console.error(`Error eliminando patrón ${pattern} de Redis:`, error);
      return 0;
    }
  }

  /**
   * Verifica si una clave existe
   */
  async exists(key: string, prefix?: string): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKey = prefix ? `${prefix}:${key}` : key;
      const result = await this.client.exists(fullKey);
      return result > 0;
    } catch (error) {
      console.error(`Error verificando clave ${key} en Redis:`, error);
      return false;
    }
  }

  /**
   * Incrementa un contador
   */
  async increment(key: string, prefix?: string, by: number = 1): Promise<number> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKey = prefix ? `${prefix}:${key}` : key;
      return await this.client.incrBy(fullKey, by);
    } catch (error) {
      console.error(`Error incrementando clave ${key} en Redis:`, error);
      return 0;
    }
  }

  /**
   * Obtiene múltiples valores en una sola operación
   */
  async mget<T>(keys: string[], prefix?: string): Promise<(T | null)[]> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const fullKeys = prefix ? keys.map(k => `${prefix}:${k}`) : keys;
      const values = await this.client.mGet(fullKeys);

      return values.map(v => {
        if (!v) return null;
        try {
          return JSON.parse(v) as T;
        } catch {
          return null;
        }
      });
    } catch (error) {
      console.error('Error obteniendo múltiples claves de Redis:', error);
      return keys.map(() => null);
    }
  }

  /**
   * Establece múltiples valores en una sola operación
   */
  async mset(
    keyValuePairs: Array<{ key: string; value: any }>,
    options: CacheOptions = {}
  ): Promise<boolean> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }

      const pairs: string[] = [];
      for (const { key, value } of keyValuePairs) {
        const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
        pairs.push(fullKey, JSON.stringify(value));
      }

      await this.client.mSet(pairs);

      // Aplicar TTL si se especifica
      if (options.ttl) {
        const pipeline = this.client.multi();
        for (const { key } of keyValuePairs) {
          const fullKey = options.prefix ? `${options.prefix}:${key}` : key;
          pipeline.expire(fullKey, options.ttl);
        }
        await pipeline.exec();
      }

      return true;
    } catch (error) {
      console.error('Error estableciendo múltiples claves en Redis:', error);
      return false;
    }
  }

  /**
   * Obtiene información del estado de Redis
   */
  async getInfo(): Promise<{ connected: boolean; host: string; port: number }> {
    return {
      connected: this.isConnected,
      host: this.host,
      port: this.port,
    };
  }
}

// Instancia singleton
let cacheInstance: RedisCache | null = null;

/**
 * Obtiene la instancia singleton de RedisCache
 */
export function getCache(): RedisCache {
  if (!cacheInstance) {
    cacheInstance = new RedisCache(
      process.env.REDIS_HOST,
      parseInt(process.env.REDIS_PORT || '6379'),
      process.env.REDIS_PASSWORD
    );
  }
  return cacheInstance;
}

