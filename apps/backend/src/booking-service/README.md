# Booking Service

The Booking Service manages all tutoring session bookings in the TutorGo platform.

## Features

- ✅ Create bookings with availability validation
- ✅ Prevent double booking
- ✅ Manage booking status (pending → confirmed → completed)
- ✅ Cancel bookings with refund triggers
- ✅ Retrieve bookings with filtering
- ✅ Event-driven architecture with RabbitMQ

## Quick Start

### Prerequisites

- PostgreSQL database
- MongoDB database
- RabbitMQ server

### Environment Variables

```env
BOOKING_SERVICE_PORT=3003
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo
MONGODB_URI=mongodb://localhost:27017/tutorgo
RABBITMQ_URL=amqp://localhost:5672
```

### Run the Service

```bash
npm run dev:booking
```

### Run Tests

```bash
npm test -- src/booking-service/__tests__
```

## API Endpoints

### Create Booking

```http
POST /bookings
Content-Type: application/json

{
  "tutorId": "uuid",
  "studentId": "uuid",
  "subject": "Mathematics",
  "startTime": "2025-12-01T10:00:00Z",
  "endTime": "2025-12-01T11:00:00Z",
  "totalAmount": 50
}
```

### Get Booking

```http
GET /bookings/:id
```

### Get User Bookings

```http
GET /bookings/user/:userId?status=confirmed&startDate=2025-12-01&subject=Math
```

### Update Status

```http
PATCH /bookings/:id/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Cancel Booking

```http
PATCH /bookings/:id/cancel
Content-Type: application/json

{
  "reason": "Change of plans"
}
```

## Business Rules

### Availability Checking

- Validates booking time against tutor's availability schedule
- Checks day of week and time slots

### Double Booking Prevention

- Prevents overlapping bookings for the same tutor
- Considers pending and confirmed bookings

### Cancellation Policy

- Requires 24-hour notice before session start
- Cannot cancel completed bookings
- Triggers refund for paid bookings

### Status Transitions

```
pending → confirmed, cancelled
confirmed → completed, cancelled
completed → (final state)
cancelled → (final state)
```

## Testing

37 unit tests covering:

- Booking creation
- Status management
- Cancellation logic
- Retrieval with filters
- Error handling

## Architecture

```
booking-service/
├── controllers/       # HTTP request handlers
├── services/          # Business logic
├── routes/            # API routes
├── dto/               # Data transfer objects
├── validators/        # Input validation
└── __tests__/         # Unit tests
```

## Related Services

- Auth Service - User validation
- Tutor Service - Availability checking
- Payment Service - Refund processing
- Notification Service - Booking notifications
