/**
 * Shared RabbitMQ module for TutorGo platform
 * Provides connection management, publishers, and consumers
 */

export * from './types';
export * from './connection';
export * from './publisher';
export * from './consumer';

import { RabbitMQConnection } from './connection';
import { RabbitMQPublisher } from './publisher';
import { RabbitMQConsumer } from './consumer';
import { RabbitMQConfig } from './types';

/**
 * Create a configured RabbitMQ connection
 */
export function createRabbitMQConnection(config?: Partial<RabbitMQConfig>): RabbitMQConnection {
  const defaultConfig: RabbitMQConfig = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost:5672',
    exchangeName: process.env.RABBITMQ_EXCHANGE || 'tutorgo_events',
    exchangeType: 'topic',
    retryAttempts: parseInt(process.env.RABBITMQ_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.RABBITMQ_RETRY_DELAY || '2000', 10),
  };

  return new RabbitMQConnection({ ...defaultConfig, ...config });
}

/**
 * Create a publisher instance
 */
export function createPublisher(connection: RabbitMQConnection): RabbitMQPublisher {
  const exchangeName = process.env.RABBITMQ_EXCHANGE || 'tutorgo_events';
  return new RabbitMQPublisher(connection, exchangeName);
}

/**
 * Create a consumer instance
 */
export function createConsumer(connection: RabbitMQConnection): RabbitMQConsumer {
  const exchangeName = process.env.RABBITMQ_EXCHANGE || 'tutorgo_events';
  return new RabbitMQConsumer(connection, exchangeName);
}
