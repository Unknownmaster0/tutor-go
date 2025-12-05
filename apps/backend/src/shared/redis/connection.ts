import { createClient, RedisClientType } from 'redis';
import { RedisConfig } from './types';

/**
 * Redis Connection Manager with retry logic and connection pooling
 */
export class RedisConnection {
  private client: RedisClientType | null = null;
  private config: RedisConfig;
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config: RedisConfig) {
    this.config = config;
  }

  /**
   * Connect to Redis with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('Redis connection attempt already in progress');
      return;
    }

    if (this.client && this.client.isOpen) {
      console.log('Already connected to Redis');
      return;
    }

    this.isConnecting = true;
    let attempts = 0;

    while (attempts < this.config.retryAttempts) {
      try {
        console.log(`Attempting to connect to Redis (attempt ${attempts + 1}/${this.config.retryAttempts})...`);

        // Create Redis client
        this.client = createClient({
          socket: {
            host: this.config.host,
            port: this.config.port,
            reconnectStrategy: (retries) => {
              if (retries > this.config.retryAttempts) {
                return new Error('Max retry attempts reached');
              }
              return this.config.retryDelay * Math.pow(2, retries - 1);
            },
          },
          password: this.config.password,
          database: this.config.db || 0,
        });

        // Set up error handlers
        this.client.on('error', (err) => {
          console.error('Redis client error:', err);
        });

        this.client.on('connect', () => {
          console.log('Redis client connected');
        });

        this.client.on('ready', () => {
          console.log('Redis client ready');
        });

        this.client.on('reconnecting', () => {
          console.log('Redis client reconnecting...');
        });

        this.client.on('end', () => {
          console.log('Redis connection closed');
        });

        // Connect to Redis
        await this.client.connect();

        console.log('✅ Successfully connected to Redis');
        this.isConnecting = false;
        return;
      } catch (error) {
        attempts++;
        console.error(`Failed to connect to Redis (attempt ${attempts}):`, error);

        if (this.client) {
          try {
            await this.client.quit();
          } catch (quitError) {
            // Ignore quit errors
          }
          this.client = null;
        }

        if (attempts < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempts - 1);
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.isConnecting = false;
    throw new Error(`Failed to connect to Redis after ${this.config.retryAttempts} attempts`);
  }

  /**
   * Get the Redis client
   */
  getClient(): RedisClientType {
    if (!this.client || !this.client.isOpen) {
      throw new Error('Redis client not initialized or not connected. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.client !== null && this.client.isOpen;
  }

  /**
   * Disconnect from Redis
   */
  async disconnect(): Promise<void> {
    try {
      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.client && this.client.isOpen) {
        await this.client.quit();
        this.client = null;
      }

      console.log('Disconnected from Redis');
    } catch (error) {
      console.error('Error disconnecting from Redis:', error);
      throw error;
    }
  }

  /**
   * Ping Redis to check connection
   */
  async ping(): Promise<string> {
    const client = this.getClient();
    return await client.ping();
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
