import { RedisConnection } from './connection';
import { RedisConfig, CacheOptions, SessionOptions } from './types';

/**
 * Redis Client with caching and session management utilities
 */
export class RedisClient {
  private connection: RedisConnection;
  private keyPrefix: string;

  constructor(config: RedisConfig) {
    this.connection = new RedisConnection(config);
    this.keyPrefix = config.keyPrefix || 'tutorgo:';
  }

  /**
   * Connect to Redis
   */
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection.isConnected();
  }

  /**
   * Ping Redis
   */
  async ping(): Promise<string> {
    return await this.connection.ping();
  }

  /**
   * Build a prefixed key
   */
  private buildKey(key: string, prefix?: string): string {
    const finalPrefix = prefix || this.keyPrefix;
    return `${finalPrefix}${key}`;
  }

  // ==================== Generic Cache Operations ====================

  /**
   * Set a value in cache
   */
  async set(key: string, value: any, options?: CacheOptions): Promise<void> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const serializedValue = JSON.stringify(value);

    if (options?.ttl) {
      await client.setEx(prefixedKey, options.ttl, serializedValue);
    } else {
      await client.set(prefixedKey, serializedValue);
    }
  }

  /**
   * Get a value from cache
   */
  async get<T = any>(key: string, options?: CacheOptions): Promise<T | null> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const value = await client.get(prefixedKey);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing cached value:', error);
      return null;
    }
  }

  /**
   * Delete a value from cache
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    await client.del(prefixedKey);
  }

  /**
   * Check if a key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const result = await client.exists(prefixedKey);
    return result === 1;
  }

  /**
   * Set expiration on a key
   */
  async expire(key: string, ttl: number, options?: CacheOptions): Promise<void> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    await client.expire(prefixedKey, ttl);
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    return await client.ttl(prefixedKey);
  }

  /**
   * Delete keys matching a pattern
   */
  async delPattern(pattern: string, options?: CacheOptions): Promise<number> {
    const client = this.connection.getClient();
    const prefixedPattern = this.buildKey(pattern, options?.prefix);
    const keys = await client.keys(prefixedPattern);

    if (keys.length === 0) {
      return 0;
    }

    await client.del(keys);
    return keys.length;
  }

  // ==================== Session Management ====================

  /**
   * Store a session (e.g., refresh token)
   */
  async setSession(sessionId: string, data: any, options?: SessionOptions): Promise<void> {
    await this.set(`session:${sessionId}`, data, {
      ttl: options?.ttl || 7 * 24 * 60 * 60, // Default 7 days
      prefix: this.keyPrefix,
    });
  }

  /**
   * Get a session
   */
  async getSession<T = any>(sessionId: string): Promise<T | null> {
    return await this.get<T>(`session:${sessionId}`);
  }

  /**
   * Delete a session (e.g., logout, token revocation)
   */
  async deleteSession(sessionId: string): Promise<void> {
    await this.del(`session:${sessionId}`);
  }

  /**
   * Check if a session exists
   */
  async sessionExists(sessionId: string): Promise<boolean> {
    return await this.exists(`session:${sessionId}`);
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeUserSessions(userId: string): Promise<number> {
    return await this.delPattern(`session:*:${userId}`);
  }

  // ==================== Cache Invalidation ====================

  /**
   * Invalidate cache by pattern (useful for tutor profile updates)
   */
  async invalidateCache(pattern: string): Promise<number> {
    return await this.delPattern(pattern);
  }

  /**
   * Flush all cache (use with caution)
   */
  async flushAll(): Promise<void> {
    const client = this.connection.getClient();
    await client.flushAll();
  }

  // ==================== Hash Operations (for complex data) ====================

  /**
   * Set a hash field
   */
  async hSet(key: string, field: string, value: any, options?: CacheOptions): Promise<void> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const serializedValue = JSON.stringify(value);
    await client.hSet(prefixedKey, field, serializedValue);

    if (options?.ttl) {
      await client.expire(prefixedKey, options.ttl);
    }
  }

  /**
   * Get a hash field
   */
  async hGet<T = any>(key: string, field: string, options?: CacheOptions): Promise<T | null> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const value = await client.hGet(prefixedKey, field);

    if (!value) {
      return null;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.error('Error parsing hash value:', error);
      return null;
    }
  }

  /**
   * Get all hash fields
   */
  async hGetAll<T = any>(key: string, options?: CacheOptions): Promise<Record<string, T>> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    const hash = await client.hGetAll(prefixedKey);

    const result: Record<string, T> = {};
    for (const [field, value] of Object.entries(hash)) {
      try {
        result[field] = JSON.parse(value) as T;
      } catch (error) {
        console.error(`Error parsing hash field ${field}:`, error);
      }
    }

    return result;
  }

  /**
   * Delete a hash field
   */
  async hDel(key: string, field: string, options?: CacheOptions): Promise<void> {
    const client = this.connection.getClient();
    const prefixedKey = this.buildKey(key, options?.prefix);
    await client.hDel(prefixedKey, field);
  }
}
