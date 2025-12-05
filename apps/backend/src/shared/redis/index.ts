import dotenv from 'dotenv';
import { RedisClient } from './client';
import { RedisConfig } from './types';

dotenv.config();

// Export types
export * from './types';
export * from './client';
export * from './connection';

// Create and export a singleton Redis client instance
const redisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  retryAttempts: parseInt(process.env.REDIS_RETRY_ATTEMPTS || '5', 10),
  retryDelay: parseInt(process.env.REDIS_RETRY_DELAY || '1000', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'tutorgo:',
};

export const redisClient = new RedisClient(redisConfig);

/**
 * Initialize Redis connection
 */
export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis connected successfully');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    throw error;
  }
};

/**
 * Disconnect from Redis
 */
export const disconnectRedis = async (): Promise<void> => {
  try {
    await redisClient.disconnect();
    console.log('Redis disconnected');
  } catch (error) {
    console.error('Redis disconnection error:', error);
  }
};
