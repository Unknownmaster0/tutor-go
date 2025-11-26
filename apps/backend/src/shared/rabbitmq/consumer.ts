import * as amqp from 'amqplib';
import { RabbitMQConnection } from './connection';
import { QueueName, RoutingKey } from './types';

export type MessageHandler = (message: any) => Promise<void>;

/**
 * Base consumer class for consuming events from RabbitMQ
 */
export class RabbitMQConsumer {
  private consumerTags: Map<string, string> = new Map();

  constructor(
    private connection: RabbitMQConnection,
    private exchangeName: string
  ) {}

  /**
   * Set up a queue with bindings and dead letter queue
   */
  async setupQueue(
    queueName: QueueName,
    routingKeys: RoutingKey[],
    options: {
      deadLetterExchange?: string;
      deadLetterRoutingKey?: string;
      messageTtl?: number;
      maxRetries?: number;
    } = {}
  ): Promise<void> {
    if (!this.connection.isConnected()) {
      throw new Error('RabbitMQ not connected. Call connect() first.');
    }

    try {
      const channel = this.connection.getChannel();

      // Set up dead letter exchange if specified
      if (options.deadLetterExchange) {
        await channel.assertExchange(options.deadLetterExchange, 'topic', {
          durable: true,
        });

        // Create dead letter queue
        const dlqName = `${queueName}.dlq`;
        await channel.assertQueue(dlqName, {
          durable: true,
        });

        await channel.bindQueue(
          dlqName,
          options.deadLetterExchange,
          options.deadLetterRoutingKey || `${queueName}.dead`
        );
      }

      // Create main queue with dead letter configuration
      const queueArgs: any = {
        durable: true,
      };

      if (options.deadLetterExchange) {
        queueArgs.deadLetterExchange = options.deadLetterExchange;
        queueArgs.deadLetterRoutingKey = options.deadLetterRoutingKey || `${queueName}.dead`;
      }

      if (options.messageTtl) {
        queueArgs.messageTtl = options.messageTtl;
      }

      await channel.assertQueue(queueName, queueArgs);

      // Bind queue to exchange with routing keys
      for (const routingKey of routingKeys) {
        await channel.bindQueue(queueName, this.exchangeName, routingKey);
        console.log(`Bound queue ${queueName} to ${routingKey}`);
      }

      console.log(`Queue ${queueName} set up successfully`);
    } catch (error) {
      console.error(`Failed to setup queue ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Start consuming messages from a queue
   */
  async consume(
    queueName: QueueName,
    handler: MessageHandler,
    options: {
      prefetchCount?: number;
      maxRetries?: number;
      retryDelay?: number;
    } = {}
  ): Promise<void> {
    if (!this.connection.isConnected()) {
      throw new Error('RabbitMQ not connected. Call connect() first.');
    }

    try {
      const channel = this.connection.getChannel();
      const prefetchCount = options.prefetchCount || 1;
      const maxRetries = options.maxRetries || 3;
      const retryDelay = options.retryDelay || 1000;

      // Set prefetch count for fair dispatch
      await channel.prefetch(prefetchCount);

      const { consumerTag } = await channel.consume(
        queueName,
        async (msg) => {
          if (!msg) {
            return;
          }

          try {
            const content = msg.content.toString();
            const message = JSON.parse(content);

            console.log(`Received message from ${queueName}:`, message);

            // Process message with handler
            await this.processMessageWithRetry(
              channel,
              msg,
              message,
              handler,
              maxRetries,
              retryDelay
            );
          } catch (error) {
            console.error(`Error processing message from ${queueName}:`, error);
            // Reject message and send to dead letter queue
            channel.nack(msg, false, false);
          }
        },
        {
          noAck: false, // Manual acknowledgment
        }
      );

      this.consumerTags.set(queueName, consumerTag);
      console.log(`Started consuming from ${queueName}`);
    } catch (error) {
      console.error(`Failed to start consuming from ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Process message with retry logic
   */
  private async processMessageWithRetry(
    channel: amqp.Channel,
    msg: amqp.ConsumeMessage,
    message: any,
    handler: MessageHandler,
    maxRetries: number,
    retryDelay: number
  ): Promise<void> {
    const retryCount = (msg.properties.headers?.['x-retry-count'] as number) || 0;

    try {
      await handler(message);
      // Acknowledge successful processing
      channel.ack(msg);
      console.log('Message processed successfully');
    } catch (error) {
      console.error(`Error processing message (attempt ${retryCount + 1}/${maxRetries}):`, error);

      if (retryCount < maxRetries) {
        // Retry with exponential backoff
        const delay = retryDelay * Math.pow(2, retryCount);
        console.log(`Retrying in ${delay}ms...`);

        await this.sleep(delay);

        // Republish message with incremented retry count
        channel.publish(
          msg.fields.exchange,
          msg.fields.routingKey,
          msg.content,
          {
            ...msg.properties,
            headers: {
              ...msg.properties.headers,
              'x-retry-count': retryCount + 1,
            },
          }
        );

        // Acknowledge original message
        channel.ack(msg);
      } else {
        // Max retries exceeded, send to dead letter queue
        console.error('Max retries exceeded, sending to dead letter queue');
        channel.nack(msg, false, false);
      }
    }
  }

  /**
   * Stop consuming from a queue
   */
  async stopConsuming(queueName: QueueName): Promise<void> {
    const consumerTag = this.consumerTags.get(queueName);
    if (!consumerTag) {
      console.log(`No active consumer for queue ${queueName}`);
      return;
    }

    try {
      const channel = this.connection.getChannel();
      await channel.cancel(consumerTag);
      this.consumerTags.delete(queueName);
      console.log(`Stopped consuming from ${queueName}`);
    } catch (error) {
      console.error(`Failed to stop consuming from ${queueName}:`, error);
      throw error;
    }
  }

  /**
   * Stop all consumers
   */
  async stopAll(): Promise<void> {
    const queues = Array.from(this.consumerTags.keys());
    for (const queue of queues) {
      await this.stopConsuming(queue as QueueName);
    }
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
