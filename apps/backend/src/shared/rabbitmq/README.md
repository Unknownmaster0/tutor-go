# RabbitMQ Integration Module

This module provides a shared RabbitMQ integration for the TutorGo platform, enabling reliable message-based communication between microservices.

## Features

- **Connection Management**: Automatic connection with retry logic and exponential backoff
- **Publisher Pattern**: Easy-to-use event publishing with type safety
- **Consumer Pattern**: Robust message consumption with retry and dead letter queue support
- **Event Types**: Strongly-typed event definitions for all platform events
- **Error Handling**: Comprehensive error handling with automatic reconnection

## Architecture

### Components

1. **RabbitMQConnection**: Manages connection to RabbitMQ server
   - Automatic retry with exponential backoff
   - Connection error handling and reconnection
   - Configurable retry attempts and delays

2. **RabbitMQPublisher**: Publishes events to exchanges
   - Type-safe event publishing
   - Persistent message delivery
   - Channel buffer management

3. **RabbitMQConsumer**: Consumes messages from queues
   - Prefetch control for fair dispatch
   - Retry logic with exponential backoff
   - Dead letter queue support
   - Manual acknowledgment

### Event Types

- **BookingCreatedEvent**: Published when a new booking is created
- **BookingCancelledEvent**: Published when a booking is cancelled
- **PaymentCompletedEvent**: Published when a payment is successfully processed
- **ReviewSubmittedEvent**: Published when a review is submitted

### Queue Configuration

- **notification.booking**: Receives booking-related events
- **notification.payment**: Receives payment-related events
- **notification.review**: Receives review-related events
- **payment.refund**: Receives refund requests

## Usage

### Setting Up a Publisher

```typescript
import { createRabbitMQConnection, createPublisher, BookingCreatedEvent } from '../shared/rabbitmq';

// Create connection and publisher
const connection = createRabbitMQConnection();
const publisher = createPublisher(connection);

// Connect to RabbitMQ
await connection.connect();

// Publish an event
const event: BookingCreatedEvent = {
  bookingId: 'booking-123',
  tutorId: 'tutor-123',
  studentId: 'student-123',
  subject: 'Math',
  startTime: new Date(),
  totalAmount: 50,
  timestamp: new Date(),
};

await publisher.publishBookingCreated(event);

// Disconnect when done
await connection.disconnect();
```

### Setting Up a Consumer

```typescript
import {
  createRabbitMQConnection,
  createConsumer,
  QueueName,
  RoutingKey,
} from '../shared/rabbitmq';

// Create connection and consumer
const connection = createRabbitMQConnection();
const consumer = createConsumer(connection);

// Connect to RabbitMQ
await connection.connect();

// Set up queue with dead letter exchange
await consumer.setupQueue(
  QueueName.NOTIFICATION_BOOKING,
  [RoutingKey.BOOKING_CREATED, RoutingKey.BOOKING_CANCELLED],
  {
    deadLetterExchange: 'tutorgo_dlx',
    deadLetterRoutingKey: 'notification.booking.dead',
    maxRetries: 3,
  },
);

// Start consuming messages
await consumer.consume(
  QueueName.NOTIFICATION_BOOKING,
  async (message) => {
    console.log('Received message:', message);
    // Process message
  },
  {
    prefetchCount: 5,
    maxRetries: 3,
    retryDelay: 2000,
  },
);

// Stop consuming and disconnect when done
await consumer.stopAll();
await connection.disconnect();
```

## Configuration

Environment variables:

- `RABBITMQ_URL`: RabbitMQ connection URL (default: `amqp://localhost:5672`)
- `RABBITMQ_EXCHANGE`: Exchange name (default: `tutorgo_events`)
- `RABBITMQ_RETRY_ATTEMPTS`: Number of connection retry attempts (default: `5`)
- `RABBITMQ_RETRY_DELAY`: Initial retry delay in milliseconds (default: `2000`)

## Error Handling

### Connection Errors

The connection manager automatically handles connection errors and attempts to reconnect:

1. Initial connection attempt
2. If failed, retry with exponential backoff
3. After max retries, throw error
4. On connection loss, automatically attempt to reconnect

### Message Processing Errors

The consumer implements a retry mechanism for failed message processing:

1. Message processing fails
2. Retry with exponential backoff (up to max retries)
3. If all retries fail, send message to dead letter queue
4. Dead letter messages can be manually reviewed and reprocessed

## Testing

All components include comprehensive unit tests:

- Connection management tests
- Publisher tests
- Consumer tests
- Service-specific integration tests

Run tests:

```bash
npm test -- apps/backend/src/shared/rabbitmq/__tests__
```

## Service Integration

### Booking Service

Publishes:

- `BookingCreatedEvent`
- `BookingCancelledEvent`

### Payment Service

Publishes:

- `PaymentCompletedEvent`

### Tutor Service

Publishes:

- `ReviewSubmittedEvent`

### Notification Service

Consumes:

- All booking events
- All payment events
- All review events

## Best Practices

1. **Always connect before publishing/consuming**: Ensure connection is established before operations
2. **Handle errors gracefully**: Implement proper error handling in message handlers
3. **Use dead letter queues**: Configure DLQ for failed messages
4. **Set appropriate prefetch**: Balance between throughput and fair distribution
5. **Implement idempotency**: Message handlers should be idempotent to handle duplicates
6. **Monitor queue depths**: Watch for growing queues indicating processing issues
7. **Graceful shutdown**: Always disconnect properly on application shutdown

## Monitoring

Key metrics to monitor:

- Connection status
- Message publish rate
- Message consumption rate
- Queue depth
- Dead letter queue depth
- Retry count
- Processing errors

## Future Enhancements

- [ ] Add message priority support
- [ ] Implement message TTL configuration
- [ ] Add metrics collection (Prometheus)
- [ ] Implement circuit breaker pattern
- [ ] Add message tracing/correlation IDs
- [ ] Support for multiple exchanges
- [ ] Add message compression
