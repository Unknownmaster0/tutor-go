import * as amqp from 'amqplib';
import { RabbitMQConfig } from './types';

/**
 * RabbitMQ Connection Manager with retry logic
 */
export class RabbitMQConnection {
  private connection: any = null;
  private channel: any = null;
  private config: RabbitMQConfig;
  private isConnecting = false;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  constructor(config: RabbitMQConfig) {
    this.config = config;
  }

  /**
   * Connect to RabbitMQ with retry logic
   */
  async connect(): Promise<void> {
    if (this.isConnecting) {
      console.log('Connection attempt already in progress');
      return;
    }

    if (this.connection && this.channel) {
      console.log('Already connected to RabbitMQ');
      return;
    }

    this.isConnecting = true;
    let attempts = 0;

    while (attempts < this.config.retryAttempts) {
      try {
        console.log(`Attempting to connect to RabbitMQ (attempt ${attempts + 1}/${this.config.retryAttempts})...`);
        
        this.connection = await amqp.connect(this.config.url);
        this.channel = await this.connection.createChannel();

        // Set up connection error handlers
        this.connection.on('error', (err) => {
          console.error('RabbitMQ connection error:', err);
          this.handleConnectionError();
        });

        this.connection.on('close', () => {
          console.log('RabbitMQ connection closed');
          this.handleConnectionError();
        });

        // Set up exchange
        await this.channel.assertExchange(this.config.exchangeName, this.config.exchangeType, {
          durable: true,
        });

        console.log('Successfully connected to RabbitMQ');
        this.isConnecting = false;
        return;
      } catch (error) {
        attempts++;
        console.error(`Failed to connect to RabbitMQ (attempt ${attempts}):`, error);

        if (attempts < this.config.retryAttempts) {
          const delay = this.config.retryDelay * Math.pow(2, attempts - 1); // Exponential backoff
          console.log(`Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    this.isConnecting = false;
    throw new Error(`Failed to connect to RabbitMQ after ${this.config.retryAttempts} attempts`);
  }

  /**
   * Handle connection errors and attempt reconnection
   */
  private handleConnectionError(): void {
    this.connection = null;
    this.channel = null;

    // Clear any existing reconnect timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }

    // Attempt to reconnect after delay
    this.reconnectTimeout = setTimeout(() => {
      console.log('Attempting to reconnect to RabbitMQ...');
      this.connect().catch((err) => {
        console.error('Reconnection failed:', err);
      });
    }, this.config.retryDelay);
  }

  /**
   * Get the current channel
   */
  getChannel(): any {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized. Call connect() first.');
    }
    return this.channel;
  }

  /**
   * Get the current connection
   */
  getConnection(): any {
    if (!this.connection) {
      throw new Error('RabbitMQ connection not initialized. Call connect() first.');
    }
    return this.connection;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.connection !== null && this.channel !== null;
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    try {
      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      if (this.channel) {
        await this.channel.close();
        this.channel = null;
      }

      if (this.connection) {
        await this.connection.close();
        this.connection = null;
      }

      console.log('Disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
      throw error;
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
