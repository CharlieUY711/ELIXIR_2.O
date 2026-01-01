/**
 * CacheManager - Gestor centralizado de caché para Elixir Core
 * Implementa estrategias de caching con Redis para mejorar el rendimiento
 */

export interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  ttl?: number; // Time to live en segundos
  keyPrefix?: string;
  cluster?: {
    nodes: Array<{ host: string; port: number }>;
  };
}

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private client: any; // Redis client
  private config: Required<CacheConfig>;
  private connected: boolean = false;

  constructor(config: CacheConfig) {
    this.config = {
      ttl: 3600, // 1 hora por defecto
      keyPrefix: 'elixir:',
      ...config,
    };
  }

  /**
   * Inicializa la conexión con Redis
   */
  async connect(): Promise<void> {
    try {
      // Lazy load de redis para evitar dependencias si no se usa
      const redis = await import('redis');
      
      if (this.config.cluster) {
        // Modo cluster
        this.client = redis.createCluster({
          rootNodes: this.config.cluster.nodes.map(node => ({
            socket: { host: node.host, port: node.port },
          })),
          defaults: {
            socket: {
              connectTimeout: 5000,
              keepAlive: true,
            },
            password: this.config.password,
          },
        });
      } else {
        // Modo standalone
        this.client = redis.createClient({
          socket: {
            host: this.config.host,
            port: this.config.port,
            connectTimeout: 5000,
            keepAlive: true,
          },
          password: this.config.password,
        });
      }

      this.client.on('error', (err: Error) => {
        console.error('Redis Client Error:', err);
        this.connected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.connected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Fail gracefully - el sistema puede funcionar sin cache
      this.connected = false;
    }
  }

  /**
   * Desconecta el cliente Redis
   */
  async disconnect(): Promise<void> {
    if (this.client && this.connected) {
      await this.client.quit();
      this.connected = false;
    }
  }

  /**
   * Obtiene un valor del cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key);
      const value = await this.client.get(fullKey);
      
      if (!value) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(value);
      
      // Verificar expiración
      const now = Date.now();
      if (now - entry.timestamp > entry.ttl * 1000) {
        await this.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Almacena un valor en el cache
   */
  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key);
      const entry: CacheEntry<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: ttl || this.config.ttl,
      };

      await this.client.setEx(
        fullKey,
        entry.ttl,
        JSON.stringify(entry)
      );

      return true;
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Elimina un valor del cache
   */
  async delete(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key);
      await this.client.del(fullKey);
      return true;
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Elimina múltiples claves que coincidan con un patrón
   */
  async deletePattern(pattern: string): Promise<number> {
    if (!this.connected || !this.client) {
      return 0;
    }

    try {
      const fullPattern = this.buildKey(pattern);
      const keys = await this.client.keys(fullPattern);
      
      if (keys.length === 0) {
        return 0;
      }

      return await this.client.del(keys);
    } catch (error) {
      console.error(`Cache deletePattern error for pattern ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Verifica si una clave existe en el cache
   */
  async exists(key: string): Promise<boolean> {
    if (!this.connected || !this.client) {
      return false;
    }

    try {
      const fullKey = this.buildKey(key);
      const result = await this.client.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Incrementa un valor numérico en el cache
   */
  async increment(key: string, by: number = 1): Promise<number | null> {
    if (!this.connected || !this.client) {
      return null;
    }

    try {
      const fullKey = this.buildKey(key);
      return await this.client.incrBy(fullKey, by);
    } catch (error) {
      console.error(`Cache increment error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  async getStats(): Promise<{ connected: boolean; info?: any }> {
    if (!this.connected || !this.client) {
      return { connected: false };
    }

    try {
      const info = await this.client.info('stats');
      return { connected: true, info };
    } catch (error) {
      return { connected: false };
    }
  }

  /**
   * Construye la clave completa con prefijo
   */
  private buildKey(key: string): string {
    return `${this.config.keyPrefix}${key}`;
  }

  /**
   * Verifica si el cache está conectado
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Factory para crear instancias de CacheManager
 */
export function createCacheManager(config: CacheConfig): CacheManager {
  return new CacheManager(config);
}

