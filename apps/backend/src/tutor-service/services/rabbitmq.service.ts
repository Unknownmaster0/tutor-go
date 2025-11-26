import {
  createRabbitMQConnection,
  createPublisher,
  RabbitMQConnection,
  RabbitMQPublisher,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';

/**
 * RabbitMQ Service for Tutor Service
 * Publishes review-related events
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
   * Publish review submitted event
   */
  async publishReviewSubmittedEvent(event: ReviewSubmittedEvent): Promise<void> {
    await this.publisher.publishReviewSubmitted(event);
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }
}
