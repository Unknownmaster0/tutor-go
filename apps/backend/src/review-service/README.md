# Review Service

The Review Service handles review submission, rating calculation, and review moderation for the TutorGo platform.

## Features

- **Review Submission**: Students can submit reviews for completed tutoring sessions
- **Rating Calculation**: Automatically calculates and updates tutor average ratings
- **Review Retrieval**: Fetch reviews for tutors with pagination support
- **Review Moderation**: Flag/unflag inappropriate reviews
- **Event Publishing**: Publishes review events to RabbitMQ for notifications

## API Endpoints

### POST /reviews

Create a new review for a completed booking.

**Request Body:**

```json
{
  "tutorId": "uuid",
  "studentId": "uuid",
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Excellent tutor!"
}
```

**Validation:**

- Rating must be between 1 and 5
- Booking must be completed
- Student must match the booking
- No duplicate reviews for the same booking

**Response:** `201 Created`

```json
{
  "id": "uuid",
  "tutorId": "uuid",
  "studentId": "uuid",
  "bookingId": "uuid",
  "rating": 5,
  "comment": "Excellent tutor!",
  "flagged": false,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### GET /reviews/tutor/:tutorId

Get reviews for a specific tutor.

**Query Parameters:**

- `limit` (optional): Number of reviews per page (default: 10, max: 100)
- `offset` (optional): Number of reviews to skip (default: 0)

**Response:** `200 OK`

```json
{
  "reviews": [
    {
      "id": "uuid",
      "tutorId": "uuid",
      "studentId": "uuid",
      "bookingId": "uuid",
      "rating": 5,
      "comment": "Great session!",
      "flagged": false,
      "createdAt": "2024-01-15T10:00:00Z"
    }
  ],
  "total": 25
}
```

### PATCH /reviews/:reviewId/flag

Flag or unflag a review for moderation.

**Request Body:**

```json
{
  "flagged": true
}
```

**Response:** `200 OK`

```json
{
  "id": "uuid",
  "tutorId": "uuid",
  "studentId": "uuid",
  "bookingId": "uuid",
  "rating": 1,
  "comment": "Inappropriate content",
  "flagged": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

## Business Logic

### Review Submission

1. Validates rating is between 1-5
2. Checks booking exists and is completed
3. Verifies student and tutor match the booking
4. Prevents duplicate reviews for the same booking
5. Creates review in PostgreSQL
6. Triggers rating calculation
7. Publishes ReviewSubmittedEvent to RabbitMQ

### Rating Calculation

1. Fetches all non-flagged reviews for the tutor
2. Calculates average rating
3. Rounds to 1 decimal place
4. Updates tutor profile in MongoDB
5. Publishes event to notification service

### Review Moderation

- Flagged reviews are excluded from public display by default
- Flagged reviews don't affect tutor rating calculations
- Admin can flag/unflag reviews via the API

## Database Schema

### PostgreSQL - Reviews Table

```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY,
  tutor_id UUID NOT NULL REFERENCES users(id),
  student_id UUID NOT NULL REFERENCES users(id),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### MongoDB - Tutor Profile Updates

The service updates the following fields in tutor profiles:

- `rating`: Average rating (1 decimal place)
- `totalReviews`: Total number of non-flagged reviews

## Events

### ReviewSubmittedEvent

Published to RabbitMQ when a new review is created.

```typescript
{
  reviewId: string;
  tutorId: string;
  studentId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}
```

## Environment Variables

```env
REVIEW_SERVICE_PORT=3006
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo
MONGODB_URI=mongodb://localhost:27017/tutorgo
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_EXCHANGE=tutorgo_exchange
NODE_ENV=development
```

## Running the Service

### Development

```bash
npm run dev:review
```

### Production

```bash
npm run build
npm start
```

### Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- review.service.spec.ts

# Run with coverage
npm run test:cov
```

## Error Handling

The service handles the following error scenarios:

- Invalid rating values (400)
- Booking not found (404)
- Booking not completed (400)
- Student/tutor mismatch (400)
- Duplicate reviews (400)
- Review not found (404)
- Database errors (500)
- RabbitMQ connection failures (graceful degradation)

## Dependencies

- **@prisma/client**: PostgreSQL ORM
- **mongoose**: MongoDB ODM
- **express**: Web framework
- **express-validator**: Request validation
- **amqplib**: RabbitMQ client

## Architecture

```
review-service/
├── controllers/       # Request handlers
├── services/         # Business logic
│   ├── review.service.ts
│   ├── rating.service.ts
│   └── rabbitmq.service.ts
├── routes/           # API routes
├── validators/       # Request validation
├── dto/              # Data transfer objects
└── __tests__/        # Unit tests
```
