# Notification Service Implementation Summary

## Overview

The Notification Service is a complete implementation that handles both email and real-time in-app notifications for the TutorGo platform. It consumes events from RabbitMQ and delivers notifications through multiple channels.

## Completed Tasks

### Task 8.1: Create notification storage and retrieval ✅

- Implemented notification CRUD operations in PostgreSQL
- Created GET /notifications/:userId endpoint
- Created PATCH /notifications/:id/read endpoint
- Comprehensive unit tests for notification operations

### Task 8.2: Implement email notification sending ✅

- Set up Nodemailer for email delivery
- Created email templates for:
  - Booking created/cancelled notifications
  - Payment completed notifications
  - Review submitted notifications
  - New message notifications
- Supports both production SMTP and development (Ethereal) configurations
- Comprehensive unit tests with 16 test cases

### Task 8.3: Implement in-app notification delivery ✅

- Implemented Socket.io server for real-time notifications
- JWT-based WebSocket authentication
- User connection tracking (online/offline status)
- Real-time notification delivery to connected users
- Support for multiple simultaneous connections per user
- Comprehensive unit tests with 20 test cases

## Architecture

### Services

#### NotificationService

- Core service for notification management
- Handles event processing from RabbitMQ
- Creates notifications in database
- Triggers email and real-time notifications
- Integrates with EmailService and SocketService

#### EmailService

- Manages email delivery using Nodemailer
- HTML email templates for all notification types
- Environment-based configuration (production/development)
- Error handling and retry logic

#### SocketService

- Real-time WebSocket communication using Socket.io
- JWT authentication middleware
- User connection tracking
- Broadcast notifications to online users
- CORS configuration for frontend integration

#### RabbitMQConsumerService

- Consumes events from multiple queues:
  - notification.booking (booking created/cancelled)
  - notification.payment (payment completed)
  - notification.review (review submitted)
- Dead letter queue configuration
- Retry logic with exponential backoff
- Prefetch count optimization

### Event Handling

The service processes the following events:

1. **BookingCreatedEvent**
   - Creates notifications for tutor and student
   - Sends email to both parties
   - Delivers real-time notification if online

2. **BookingCancelledEvent**
   - Creates cancellation notifications
   - Includes cancellation reason
   - Sends email and real-time notifications

3. **PaymentCompletedEvent**
   - Notifies tutor of payment received
   - Notifies student of payment confirmation
   - Includes payment amount

4. **ReviewSubmittedEvent**
   - Notifies tutor of new review
   - Includes rating and comment
   - Sends email and real-time notification

## API Endpoints

### GET /notifications/:userId

Retrieve all notifications for a user, ordered by most recent first.

**Response:**

```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "booking|payment|message|review",
    "title": "string",
    "message": "string",
    "read": boolean,
    "createdAt": "ISO date",
    "metadata": {}
  }
]
```

### PATCH /notifications/:id/read

Mark a notification as read or unread.

**Request:**

```json
{
  "read": true
}
```

**Response:**

```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "booking",
  "title": "string",
  "message": "string",
  "read": true,
  "createdAt": "ISO date",
  "metadata": {}
}
```

## WebSocket Events

### Client → Server

#### Connection

```javascript
const socket = io('http://localhost:3007', {
  auth: {
    token: 'JWT_TOKEN',
  },
});
```

### Server → Client

#### connected

Sent when client successfully connects.

```json
{
  "userId": "uuid",
  "socketId": "string"
}
```

#### notification

Sent when a new notification is created for the user.

```json
{
  "id": "uuid",
  "userId": "uuid",
  "type": "booking|payment|message|review",
  "title": "string",
  "message": "string",
  "read": false,
  "createdAt": "ISO date",
  "metadata": {}
}
```

## Configuration

### Environment Variables

```env
# Service Port
NOTIFICATION_SERVICE_PORT=3007

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# JWT Secret for WebSocket authentication
JWT_SECRET=your-secret-key

# Email Configuration (Production)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-password
EMAIL_FROM=noreply@tutorgo.com

# Email Configuration (Development - Ethereal)
ETHEREAL_USER=test@ethereal.email
ETHEREAL_PASS=test

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
```

## Testing

### Test Coverage

- **Total Tests:** 57 passing
- **Email Service:** 16 tests
- **Socket Service:** 20 tests
- **Notification Service:** 12 tests
- **RabbitMQ Consumer:** 9 tests

### Running Tests

```bash
# Run all notification service tests
npm test --workspace=apps/backend -- src/notification-service/__tests__ --run

# Run specific test file
npm test --workspace=apps/backend -- src/notification-service/__tests__/email.service.spec.ts --run
```

## Dependencies

### Production

- `nodemailer` - Email delivery
- `socket.io` - Real-time WebSocket communication
- `jsonwebtoken` - JWT authentication
- `amqplib` - RabbitMQ client (via shared module)

### Development

- `@types/nodemailer` - TypeScript types for Nodemailer
- `jest` - Testing framework
- `@types/jest` - TypeScript types for Jest

## Integration Points

### Database (PostgreSQL)

- `notifications` table for storing notification records
- `users` table for fetching user details (email, name)

### RabbitMQ

- Consumes from notification queues
- Dead letter exchange for failed messages
- Retry mechanism with exponential backoff

### Other Services

- Auth Service: JWT token validation
- Booking Service: Booking event publisher
- Payment Service: Payment event publisher
- Tutor Service: Review event publisher

## Future Enhancements

1. **Push Notifications**
   - Mobile push notifications via Firebase Cloud Messaging
   - Browser push notifications via Web Push API

2. **Notification Preferences**
   - User settings for notification channels
   - Frequency controls (immediate, digest, off)

3. **Notification Templates**
   - Template management system
   - Multi-language support
   - Customizable email templates

4. **Analytics**
   - Notification delivery metrics
   - Open/click tracking for emails
   - User engagement analytics

5. **Batch Notifications**
   - Digest emails for multiple notifications
   - Scheduled notification delivery

## Deployment Notes

1. Ensure RabbitMQ is running and accessible
2. Configure SMTP credentials for production email delivery
3. Set up proper CORS configuration for WebSocket connections
4. Monitor dead letter queues for failed notifications
5. Set up logging and error tracking (e.g., Sentry)
6. Configure health check endpoints for monitoring

## Troubleshooting

### Email Not Sending

- Verify SMTP credentials
- Check firewall rules for SMTP port
- Review email service logs
- Test with Ethereal in development

### WebSocket Connection Issues

- Verify JWT token is valid
- Check CORS configuration
- Ensure frontend URL is whitelisted
- Review browser console for errors

### RabbitMQ Consumer Issues

- Check RabbitMQ connection
- Verify queue names and routing keys
- Review dead letter queue for failed messages
- Check consumer prefetch settings

## Conclusion

The Notification Service is fully implemented with comprehensive test coverage. It provides reliable email and real-time notification delivery, integrates seamlessly with other services via RabbitMQ, and is ready for production deployment.
