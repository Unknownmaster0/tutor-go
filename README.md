# TutorGo Platform

A location-based online tutor booking platform built with Next.js and Express.js microservices.

## Project Structure

```
tutorgo-platform/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/           # NestJS microservices
│       └── src/
│           ├── auth-service/
│           ├── tutor-service/
│           ├── booking-service/
│           ├── payment-service/
│           ├── chat-service/
│           └── notification-service/
├── packages/              # Shared packages (future)
├── docker-compose.yml     # Docker services for local development
└── package.json           # Root workspace configuration
```

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose
- Git

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd tutorgo-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Copy example env files
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local
```

Edit the `.env` files with your configuration.

### 4. Start Docker services

```bash
# Start PostgreSQL, MongoDB, Redis, and RabbitMQ
docker-compose up -d
```

Verify services are running:

- PostgreSQL: `localhost:5432`
- MongoDB: `localhost:27017`
- Redis: `localhost:6379`
- RabbitMQ: `localhost:5672` (Management UI: `http://localhost:15672`)

### 5. Run the application

```bash
# Run all services in development mode
npm run dev

# Or run frontend and backend separately
npm run dev:frontend
npm run dev:backend
```

### 6. Access the applications

- Frontend: http://localhost:3000
- Auth Service: http://localhost:3001
- Tutor Service: http://localhost:3002
- Booking Service: http://localhost:3003
- Payment Service: http://localhost:3004
- Chat Service: http://localhost:3006
- Notification Service: http://localhost:3007

## Development

### Code Formatting

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Linting

```bash
# Lint all workspaces
npm run lint
```

### Git Hooks

Pre-commit hooks are automatically set up with Husky to run linting and formatting on staged files.

## Docker Services

### Start all services

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### View logs

```bash
docker-compose logs -f [service-name]
```

### Reset databases

```bash
docker-compose down -v
docker-compose up -d
```

## Service Ports

| Service              | Port  |
| -------------------- | ----- |
| Frontend             | 3000  |
| Auth Service         | 3001  |
| Tutor Service        | 3002  |
| Booking Service      | 3003  |
| Payment Service      | 3004  |
| Chat Service         | 3006  |
| Notification Service | 3007  |
| PostgreSQL           | 5432  |
| MongoDB              | 27017 |
| Redis                | 6379  |
| RabbitMQ             | 5672  |
| RabbitMQ Management  | 15672 |

## Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Socket.io Client

### Backend

- Express.js
- TypeScript
- TypeORM (PostgreSQL)
- Mongoose (MongoDB)
- Redis
- RabbitMQ
- Socket.io

### Infrastructure

- Docker & Docker Compose
- PostgreSQL
- MongoDB
- Redis
- RabbitMQ

## License

MIT
