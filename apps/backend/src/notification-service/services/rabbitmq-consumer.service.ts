import {
  createRabbitMQConnection,
  createConsumer,
  RabbitMQConnection,
  RabbitMQConsumer,
  QueueName,
  RoutingKey,
  BookingCreatedEvent,
  BookingCancelledEvent,
  PaymentCompletedEvent,
  ReviewSubmittedEvent,
} from '../../shared/rabbitmq';
import { NotificationService } from './notification.service';

/**
 * RabbitMQ Consumer Service for Notification Service
 * Consumes events and triggers notifications
 */
export class RabbitMQConsumerService {
  private connection: RabbitMQConnection;
  private consumer: RabbitMQConsumer;
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService) {
    this.connection = createRabbitMQConnection();
    this.consumer = createConsumer(this.connection);
    this.notificationService = notificationService;
  }

  /**
   * Initialize RabbitMQ connection and set up queues
   */
  async initialize(): Promise<void> {
    await this.connection.connect();

    // Set up dead letter exchange for failed messages
    const deadLetterExchange = 'tutorgo_dlx';

    // Set up booking notification queue
    await this.consumer.setupQueue(
      QueueName.NOTIFICATION_BOOKING,
      [RoutingKey.BOOKING_CREATED, RoutingKey.BOOKING_CANCELLED],
      {
        deadLetterExchange,
        deadLetterRoutingKey: 'notification.booking.dead',
        maxRetries: 3,
      }
    );

    // Set up payment notification queue
    await this.consumer.setupQueue(
      QueueName.NOTIFICATION_PAYMENT,
      [RoutingKey.PAYMENT_COMPLETED],
      {
        deadLetterExchange,
        deadLetterRoutingKey: 'notification.payment.dead',
        maxRetries: 3,
      }
    );

    // Set up review notification queue
    await this.consumer.setupQueue(
      QueueName.NOTIFICATION_REVIEW,
      [RoutingKey.REVIEW_SUBMITTED],
      {
        deadLetterExchange,
        deadLetterRoutingKey: 'notification.review.dead',
        maxRetries: 3,
      }
    );

    console.log('RabbitMQ queues set up successfully');
  }

  /**
   * Start consuming messages from all queues
   */
  async startConsuming(): Promise<void> {
    // Consume booking events
    await this.consumer.consume(
      QueueName.NOTIFICATION_BOOKING,
      async (message) => {
        await this.handleBookingEvent(message);
      },
      {
        prefetchCount: 5,
        maxRetries: 3,
        retryDelay: 2000,
      }
    );

    // Consume payment events
    await this.consumer.consume(
      QueueName.NOTIFICATION_PAYMENT,
      async (message) => {
        await this.handlePaymentEvent(message);
      },
      {
        prefetchCount: 5,
        maxRetries: 3,
        retryDelay: 2000,
      }
    );

    // Consume review events
    await this.consumer.consume(
      QueueName.NOTIFICATION_REVIEW,
      async (message) => {
        await this.handleReviewEvent(message);
      },
      {
        prefetchCount: 5,
        maxRetries: 3,
        retryDelay: 2000,
      }
    );

    console.log('Started consuming messages from all queues');
  }

  /**
   * Handle booking events (created and cancelled)
   */
  private async handleBookingEvent(
    message: BookingCreatedEvent | BookingCancelledEvent
  ): Promise<void> {
    if ('subject' in message) {
      // BookingCreatedEvent
      await this.notificationService.handleBookingCreated(message as BookingCreatedEvent);
    } else {
      // BookingCancelledEvent
      await this.notificationService.handleBookingCancelled(message as BookingCancelledEvent);
    }
  }

  /**
   * Handle payment completed events
   */
  private async handlePaymentEvent(message: PaymentCompletedEvent): Promise<void> {
    await this.notificationService.handlePaymentCompleted(message);
  }

  /**
   * Handle review submitted events
   */
  private async handleReviewEvent(message: ReviewSubmittedEvent): Promise<void> {
    await this.notificationService.handleReviewSubmitted(message);
  }

  /**
   * Stop consuming and disconnect
   */
  async shutdown(): Promise<void> {
    await this.consumer.stopAll();
    await this.connection.disconnect();
    console.log('RabbitMQ consumer shut down successfully');
  }
}
