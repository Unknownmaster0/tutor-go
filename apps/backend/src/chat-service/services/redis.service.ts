import { createClient, RedisClientType } from 'redis';
import { Logger } from '../../shared';

export class RedisService {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private logger: Logger;

  constructor() {
    this.logger = new Logger('RedisService');
    this.client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error', err));
    this.client.on('connect', () => {
      this.isConnected = true;
      this.logger.log('✅ Redis connected successfully');
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  /**
   * Set user as online
   */
  async setUserOnline(userId: string, socketId: string): Promise<void> {
    try {
      const key = `user:${userId}:status`;
      await this.client.set(key, 'online');
      await this.client.expire(key, 3600); // Expire after 1 hour of inactivity

      // Store socket ID mapping
      await this.client.set(`user:${userId}:socket`, socketId);
      await this.client.expire(`user:${userId}:socket`, 3600);

      this.logger.log(`User ${userId} set to online`);
    } catch (error) {
      this.logger.error('Error setting user online:', error);
    }
  }

  /**
   * Set user as offline
   */
  async setUserOffline(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:status`;
      await this.client.set(key, 'offline');
      await this.client.expire(key, 86400); // Keep offline status for 24 hours

      // Remove socket ID mapping
      await this.client.del(`user:${userId}:socket`);

      this.logger.log(`User ${userId} set to offline`);
    } catch (error) {
      this.logger.error('Error setting user offline:', error);
    }
  }

  /**
   * Check if user is online
   */
  async isUserOnline(userId: string): Promise<boolean> {
    try {
      const key = `user:${userId}:status`;
      const status = await this.client.get(key);
      return status === 'online';
    } catch (error) {
      this.logger.error('Error checking user online status:', error);
      return false;
    }
  }

  /**
   * Get user's socket ID
   */
  async getUserSocketId(userId: string): Promise<string | null> {
    try {
      return await this.client.get(`user:${userId}:socket`);
    } catch (error) {
      this.logger.error('Error getting user socket ID:', error);
      return null;
    }
  }

  /**
   * Queue message for offline user
   */
  async queueMessageForOfflineUser(userId: string, message: any): Promise<void> {
    try {
      const key = `user:${userId}:offline_messages`;
      await this.client.rPush(key, JSON.stringify(message));
      await this.client.expire(key, 604800); // Keep for 7 days

      this.logger.log(`Message queued for offline user ${userId}`);
    } catch (error) {
      this.logger.error('Error queuing message:', error);
    }
  }

  /**
   * Get and clear queued messages for user
   */
  async getQueuedMessages(userId: string): Promise<any[]> {
    try {
      const key = `user:${userId}:offline_messages`;
      const messages = await this.client.lRange(key, 0, -1);
      
      if (messages.length > 0) {
        await this.client.del(key);
        this.logger.log(`Retrieved ${messages.length} queued messages for user ${userId}`);
      }

      return messages.map(msg => JSON.parse(msg));
    } catch (error) {
      this.logger.error('Error getting queued messages:', error);
      return [];
    }
  }

  /**
   * Increment unread message count
   */
  async incrementUnreadCount(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:unread_count`;
      await this.client.incr(key);
      await this.client.expire(key, 604800); // Keep for 7 days
    } catch (error) {
      this.logger.error('Error incrementing unread count:', error);
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const key = `user:${userId}:unread_count`;
      const count = await this.client.get(key);
      return count ? parseInt(count, 10) : 0;
    } catch (error) {
      this.logger.error('Error getting unread count:', error);
      return 0;
    }
  }

  /**
   * Reset unread message count
   */
  async resetUnreadCount(userId: string): Promise<void> {
    try {
      const key = `user:${userId}:unread_count`;
      await this.client.del(key);
    } catch (error) {
      this.logger.error('Error resetting unread count:', error);
    }
  }
}
