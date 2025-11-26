import {
  createRabbitMQConnection,
  createPublisher,
  RabbitMQConnection,
  RabbitMQPublisher,
  PaymentCompletedEvent,
} from '../../shared/rabbitmq';

/**
 * RabbitMQ Service for Payment Service
 * Publishes payment-related events
 */
export class RabbitMQService {
  private connection: RabbitMQConnection;
  private publisher: RabbitMQPublisher;

  constructor() {
    this.connection = createRabbitMQConnection();
    this.publisher = createPublisher(this.connection);
  }

  /**
   * Connect to RabbitMQ
   */
  async connect(): Promise<void> {
    await this.connection.connect();
  }

  /**
   * Publish payment completed event
   */
  async publishPaymentCompletedEvent(event: PaymentCompletedEvent): Promise<void> {
    await this.publisher.publishPaymentCompleted(event);
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }
}
