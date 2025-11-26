# TutorGo Platform - Getting Started

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Docker Desktop
- Git

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env.local

# 3. Start Docker services (PostgreSQL, MongoDB, Redis, RabbitMQ)
docker-compose up -d

# 4. Start all services
npm run dev
```

### Access the Application

- **Frontend**: http://localhost:3000
- **Auth Service**: http://localhost:3001
- **Tutor Service**: http://localhost:3002
- **Booking Service**: http://localhost:3003
- **Payment Service**: http://localhost:3004
- **Chat Service**: http://localhost:3006
- **Notification Service**: http://localhost:3007

## 📁 Project Structure

```
tutorgo-platform/
├── apps/
│   ├── frontend/              # Next.js 14 frontend
│   │   └── src/
│   └── backend/               # Express.js microservices
│       └── src/
│           ├── auth-service/
│           ├── tutor-service/
│           ├── booking-service/
│           ├── payment-service/
│           ├── chat-service/
│           ├── notification-service/
│           └── shared/        # Shared utilities
├── docker-compose.yml         # Infrastructure services
└── package.json               # Workspace configuration
```

## 🛠️ Tech Stack

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

## 📝 Common Commands

```bash
# Development
npm run dev              # Start all services
npm run dev:frontend     # Frontend only
npm run dev:backend      # All backend services

# Individual backend services
npm run dev:auth
npm run dev:tutor
npm run dev:booking
npm run dev:payment
npm run dev:chat
npm run dev:notification

# Code quality
npm run lint             # Lint code
npm run format           # Format code

# Docker
docker-compose up -d     # Start infrastructure
docker-compose down      # Stop infrastructure
docker-compose ps        # Check status
docker-compose logs -f   # View logs
```

## 🔧 Development Workflow

1. Make changes to any service
2. Service auto-restarts (hot reload)
3. Test your changes
4. Commit when ready

## 📚 Documentation

- `README.md` - Main documentation
- `QUICKSTART.md` - Quick reference
- `DEVELOPMENT.md` - Detailed development guide
- `.kiro/specs/tutorgo-platform/` - Project specifications

## 🎯 Next Steps

1. ✅ **Task 1 Complete**: Project setup
2. 🔜 **Task 2**: Implement database schemas
3. 🔜 **Task 3**: Build authentication
4. 🔜 **Task 4**: Implement business logic

## 💡 Tips

- All services have hot reload enabled
- Check health endpoints: `http://localhost:PORT/health`
- Use shared utilities in `apps/backend/src/shared/`
- Follow the task list in `.kiro/specs/tutorgo-platform/tasks.md`

## 🆘 Need Help?

- Check `DEVELOPMENT.md` for detailed guides
- Review `QUICKSTART.md` for quick reference
- See `README.md` for comprehensive documentation

Happy coding! 🚀
