import {
  createRabbitMQConnection,
  createPublisher,
  RabbitMQConnection,
  RabbitMQPublisher,
  BookingCreatedEvent,
  BookingCancelledEvent,
} from '../../shared/rabbitmq';

/**
 * RabbitMQ Service for Booking Service
 * Publishes booking-related events
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
   * Publish booking created event
   */
  async publishBookingCreatedEvent(event: BookingCreatedEvent): Promise<void> {
    await this.publisher.publishBookingCreated(event);
  }

  /**
   * Publish booking cancelled event
   */
  async publishBookingCancelledEvent(event: BookingCancelledEvent): Promise<void> {
    await this.publisher.publishBookingCancelled(event);
  }

  /**
   * Disconnect from RabbitMQ
   */
  async disconnect(): Promise<void> {
    await this.connection.disconnect();
  }
}
