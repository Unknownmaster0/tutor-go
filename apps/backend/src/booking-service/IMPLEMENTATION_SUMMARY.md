# Booking Service Implementation Summary

## Overview

The Booking Service is a core microservice in the TutorGo platform that handles all booking-related operations including creation, status management, cancellation, and retrieval of tutoring session bookings.

## Implemented Features

### 1. Booking Creation (Task 5.1)

- **Endpoint**: `POST /bookings`
- **Features**:
  - Validates tutor and student existence
  - Checks tutor availability from MongoDB
  - Prevents double booking with conflict detection
  - Creates booking with "pending" status
  - Validates time ranges (no past bookings, end time after start time)
- **Tests**: 10 unit tests covering all scenarios

### 2. Booking Status Management (Task 5.2)

- **Endpoint**: `PATCH /bookings/:id/status`
- **Features**:
  - Implements status transition validation
  - Valid transitions:
    - pending → confirmed, cancelled
    - confirmed → completed, cancelled
    - completed → (no transitions)
    - cancelled → (no transitions)
- **Tests**: 9 unit tests covering all status transitions

### 3. Booking Cancellation (Task 5.3)

- **Endpoint**: `PATCH /bookings/:id/cancel`
- **Features**:
  - Enforces 24-hour cancellation deadline
  - Prevents cancellation of completed bookings
  - Triggers refund process via RabbitMQ for paid bookings
  - Stores cancellation reason
  - Graceful handling of RabbitMQ failures
- **Tests**: 8 unit tests covering all cancellation scenarios

### 4. Booking Retrieval (Task 5.4)

- **Endpoints**:
  - `GET /bookings/:id` - Get single booking
  - `GET /bookings/user/:userId` - Get user's bookings
- **Features**:
  - Retrieves bookings for both tutors and students
  - Filtering by:
    - Status (pending, confirmed, completed, cancelled)
    - Date range (startDate, endDate)
    - Subject (case-insensitive search)
  - Results ordered by start time (descending)
- **Tests**: 10 unit tests covering all retrieval scenarios

## Architecture

### Service Layer

- **BookingService**: Core business logic
  - Booking creation with validation
  - Availability checking
  - Double booking prevention
  - Status management
  - Cancellation logic
  - Retrieval with filtering

- **RabbitMQService**: Event publishing
  - Publishes booking cancelled events
  - Triggers refund process in Payment Service
  - Graceful error handling

### Controller Layer

- **BookingController**: HTTP request handling
  - Request validation
  - Response formatting
  - Error handling

### Routes

- RESTful API endpoints
- Express validator middleware
- Validation error handling

### DTOs

- `CreateBookingDto`: Booking creation data
- `BookingResponseDto`: Booking response format
- `UpdateBookingStatusDto`: Status update data
- `CancelBookingDto`: Cancellation data

### Validators

- Input validation using express-validator
- UUID validation
- Date validation
- Status enum validation
- Query parameter validation

## Database Integration

### PostgreSQL (via Prisma)

- Bookings table for transactional data
- User validation
- Status management
- Filtering and querying

### MongoDB (via Mongoose)

- Tutor profiles for availability checking
- Geospatial data access

### RabbitMQ

- Event-driven architecture
- Booking cancelled events
- Asynchronous refund processing

## Key Business Rules

1. **Availability Checking**
   - Validates against tutor's availability schedule
   - Checks day of week and time slots
   - Ensures booking falls within available hours

2. **Double Booking Prevention**
   - Checks for overlapping bookings
   - Considers pending and confirmed bookings
   - Prevents time slot conflicts

3. **Cancellation Policy**
   - 24-hour minimum notice required
   - Cannot cancel completed bookings
   - Automatic refund trigger for paid bookings

4. **Status Transitions**
   - Enforces valid state machine transitions
   - Prevents invalid status changes
   - Maintains booking lifecycle integrity

## Testing

### Test Coverage

- **Total Tests**: 37 unit tests
- **Test Files**: 4 test suites
  - booking.service.spec.ts (10 tests)
  - booking-status.spec.ts (9 tests)
  - booking-cancellation.spec.ts (8 tests)
  - booking-retrieval.spec.ts (10 tests)

### Test Scenarios

- ✅ Successful booking creation
- ✅ Validation errors (tutor/student not found, invalid times)
- ✅ Availability checking
- ✅ Double booking prevention
- ✅ Status transitions (valid and invalid)
- ✅ Cancellation with deadline enforcement
- ✅ RabbitMQ event publishing
- ✅ Retrieval with various filters
- ✅ Error handling

## API Endpoints

### Create Booking

```
POST /bookings
Body: {
  tutorId: string,
  studentId: string,
  subject: string,
  startTime: Date,
  endTime: Date,
  totalAmount: number
}
```

### Get Booking by ID

```
GET /bookings/:id
```

### Get User Bookings

```
GET /bookings/user/:userId?status=confirmed&startDate=2025-12-01&endDate=2025-12-31&subject=Math
```

### Update Booking Status

```
PATCH /bookings/:id/status
Body: {
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}
```

### Cancel Booking

```
PATCH /bookings/:id/cancel
Body: {
  reason?: string
}
```

## Dependencies

- Express.js - Web framework
- Prisma - PostgreSQL ORM
- Mongoose - MongoDB ODM
- amqplib - RabbitMQ client
- express-validator - Input validation
- Jest - Testing framework

## Environment Variables

- `BOOKING_SERVICE_PORT` - Service port (default: 3003)
- `DATABASE_URL` - PostgreSQL connection string
- `MONGODB_URI` - MongoDB connection string
- `RABBITMQ_URL` - RabbitMQ connection string (default: amqp://localhost:5672)

## Future Enhancements

- Add booking reminders
- Implement recurring bookings
- Add booking notes/comments
- Support for group sessions
- Integration with calendar services
- Real-time booking notifications via WebSocket

## Related Services

- **Auth Service**: User authentication and validation
- **Tutor Service**: Tutor profile and availability management
- **Payment Service**: Payment processing and refunds
- **Notification Service**: Booking notifications

## Requirements Satisfied

- ✅ Requirement 5.1: Session booking creation
- ✅ Requirement 5.2: Booking status management
- ✅ Requirement 5.3: Time slot validation
- ✅ Requirement 5.4: Booking cancellation
- ✅ Requirement 5.5: Double booking prevention
- ✅ Requirement 5.6: Event-driven notifications
- ✅ Requirement 12.1-12.4: Session history and filtering
