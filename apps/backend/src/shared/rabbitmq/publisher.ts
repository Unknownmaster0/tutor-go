import { RabbitMQConnection } from './connection';
import { EventType, RoutingKey } from './types';

/**
 * Base publisher class for publishing events to RabbitMQ
 */
export class RabbitMQPublisher {
  constructor(
    private connection: RabbitMQConnection,
    private exchangeName: string
  ) {}

  /**
   * Publish an event to RabbitMQ
   */
  async publish(routingKey: RoutingKey, event: EventType): Promise<void> {
    if (!this.connection.isConnected()) {
      throw new Error('RabbitMQ not connected. Call connect() first.');
    }

    try {
      const channel = this.connection.getChannel();
      const message = JSON.stringify(event);

      const published = channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(message),
        {
          persistent: true,
          contentType: 'application/json',
          timestamp: Date.now(),
        }
      );

      if (!published) {
        throw new Error('Failed to publish message - channel buffer full');
      }

      console.log(`Published event to ${routingKey}:`, event);
    } catch (error) {
      console.error(`Failed to publish event to ${routingKey}:`, error);
      throw error;
    }
  }

  /**
   * Publish booking created event
   */
  async publishBookingCreated(event: EventType): Promise<void> {
    await this.publish(RoutingKey.BOOKING_CREATED, event);
  }

  /**
   * Publish booking cancelled event
   */
  async publishBookingCancelled(event: EventType): Promise<void> {
    await this.publish(RoutingKey.BOOKING_CANCELLED, event);
  }

  /**
   * Publish payment completed event
   */
  async publishPaymentCompleted(event: EventType): Promise<void> {
    await this.publish(RoutingKey.PAYMENT_COMPLETED, event);
  }

  /**
   * Publish review submitted event
   */
  async publishReviewSubmitted(event: EventType): Promise<void> {
    await this.publish(RoutingKey.REVIEW_SUBMITTED, event);
  }
}
