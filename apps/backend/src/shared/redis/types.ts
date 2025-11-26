/**
 * Redis Configuration Interface
 */
export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  retryAttempts: number;
  retryDelay: number;
  keyPrefix?: string;
}

/**
 * Cache Options Interface
 */
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Session Storage Options
 */
export interface SessionOptions {
  ttl?: number; // Time to live in seconds
}
