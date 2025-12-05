# Admin Service

The Admin Service provides administrative functionality for the TutorGo platform, including dashboard metrics, user management, content moderation, and transaction history.

## Features

### 1. Admin Dashboard Metrics

- Total users, students, and tutors
- Booking statistics (total, pending, confirmed, completed, cancelled)
- Revenue metrics and average booking value
- Recent activity (new users, bookings, and revenue today)

### 2. User Management

- Search and filter users by email, name, role, and status
- Paginated user listing
- Suspend/unsuspend user accounts with reason logging
- View user details and activity

### 3. Content Moderation

- View flagged reviews and messages
- Moderation actions: approve, remove, or warn
- Track moderation history
- Ordered by most recent first

### 4. Transaction History

- View all payment transactions
- Filter by date range, status, and user
- Paginated transaction listing
- Include refund information
- Ordered by most recent first

## API Endpoints

All endpoints require authentication and admin role.

### Metrics

```
GET /admin/metrics
```

Returns dashboard statistics including users, bookings, and revenue.

### User Management

```
GET /admin/users?search=john&role=tutor&status=active&page=1&limit=20
```

Search and filter users with pagination.

```
PATCH /admin/users/:id/suspend
Body: { reason: "Violation of terms" }
```

Suspend a user account with a reason.

```
PATCH /admin/users/:id/unsuspend
```

Unsuspend a user account.

### Content Moderation

```
GET /admin/flagged-content
```

Get all flagged reviews and messages.

```
POST /admin/flagged-content/:id/moderate
Body: { type: "review", action: "approve", reason: "Optional reason" }
```

Moderate flagged content. Actions: approve, remove, warn.

### Transaction History

```
GET /admin/transactions?startDate=2024-01-01&endDate=2024-01-31&status=succeeded&userId=123&page=1&limit=20
```

Get transaction history with filters and pagination.

## Database Schema Changes

### Users Table

Added fields for user suspension:

- `suspended` (BOOLEAN, default: false)
- `suspension_reason` (TEXT, nullable)

### Messages Table

Added field for content moderation:

- `flagged` (BOOLEAN, default: false)

## Running the Service

```bash
# Development
npm run dev

# Production
npm start

# Run tests
npm test -- src/admin-service/__tests__/
```

## Environment Variables

```
ADMIN_SERVICE_PORT=3007
DATABASE_URL=postgresql://user:password@localhost:5432/tutorgo
JWT_SECRET=your-secret-key
```

## Security

- All endpoints require JWT authentication
- Admin role is required for all operations
- Suspension reasons are logged for audit purposes
- Moderation actions are tracked with moderator ID

## Testing

The service includes comprehensive unit tests covering:

- Admin metrics calculation
- User search and filtering
- User suspension/unsuspension
- Content moderation workflows
- Transaction history retrieval
- Error handling

Run tests with:

```bash
npm test -- src/admin-service/__tests__/
```

## Dependencies

- Express.js - Web framework
- Prisma - Database ORM
- JWT - Authentication
- Zod - Validation
- Jest - Testing

## Architecture

The service follows a layered architecture:

- **Routes** - Define API endpoints and apply middleware
- **Controllers** - Handle HTTP requests and responses
- **Services** - Implement business logic
- **Validators** - Validate request data using Zod schemas
- **DTOs** - Define data transfer objects

## Error Handling

The service uses standardized error responses:

- 400 - Bad Request (validation errors)
- 401 - Unauthorized (missing/invalid token)
- 403 - Forbidden (insufficient permissions)
- 404 - Not Found (resource not found)
- 500 - Internal Server Error (unexpected errors)

## Future Enhancements

- Activity logging and audit trails
- Advanced analytics and reporting
- Bulk user operations
- Automated content moderation using ML
- Export functionality for reports
- Real-time dashboard updates via WebSocket
