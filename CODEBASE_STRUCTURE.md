# 🗂️ Codebase Structure & File Organization Guide

**Purpose**: Help navigate and understand the project structure for implementing tasks.

---

## 📁 Project Root Structure

```
d:\WEB DEV\Tutor-go\
├── 📄 tasks.md                                    ← MAIN TASKS DOCUMENT
├── 📄 TASKS_QUICK_START.md                        ← Quick reference
├── 📄 API_ENDPOINTS_REFERENCE.md                  ← All API endpoints
├── 📄 CODEBASE_STRUCTURE.md                       ← This file
│
├── apps/
│   ├── frontend/                                  ← Next.js Frontend (Port 3000)
│   │   ├── src/
│   │   │   ├── lib/
│   │   │   │   ├── api-client.ts                  ← FRONTEND API CLIENT
│   │   │   │   ├── token-storage.ts               ← Token management
│   │   │   │   └── socket-client.ts               ← WebSocket client
│   │   │   ├── app/                               ← Next.js pages
│   │   │   │   ├── page.tsx                       ← Home page
│   │   │   │   ├── auth/
│   │   │   │   │   ├── login/page.tsx             ← Login page
│   │   │   │   │   └── register/page.tsx          ← Register page
│   │   │   │   ├── dashboard/
│   │   │   │   │   ├── tutor/
│   │   │   │   │   │   ├── profile/page.tsx       ← Tutor profile
│   │   │   │   │   │   └── availability/page.tsx  ← Tutor availability
│   │   │   │   │   └── student/                   ← Student dashboard
│   │   │   │   ├── tutors/
│   │   │   │   │   ├── page.tsx                   ← Tutors list
│   │   │   │   │   └── [id]/page.tsx              ← Tutor detail
│   │   │   │   ├── search/page.tsx                ← Search page
│   │   │   │   └── admin/                         ← Admin pages
│   │   │   ├── hooks/                             ← Custom React hooks
│   │   │   │   └── use-*.ts                       ← Hook files
│   │   │   ├── components/                        ← React components
│   │   │   ├── contexts/                          ← React contexts
│   │   │   ├── types/                             ← TypeScript types
│   │   │   └── __tests__/                         ← Frontend tests
│   │   ├── .env.example                           ← Environment template
│   │   └── package.json                           ← Frontend dependencies
│   │
│   └── backend/                                   ← Express Backend Services
│       ├── src/
│       │   ├── gateway/                           ← API GATEWAY (Port 8000)
│       │   │   └── index.ts                       ← GATEWAY MAIN FILE
│       │   │
│       │   ├── auth-service/                      ← Auth Service (Port 8001)
│       │   │   ├── index.ts                       ← Service entry point
│       │   │   ├── routes/
│       │   │   │   └── auth.routes.ts             ← Auth routes
│       │   │   ├── controllers/
│       │   │   │   └── auth.controller.ts         ← Auth controller
│       │   │   ├── services/
│       │   │   │   └── auth.service.ts            ← Auth business logic
│       │   │   ├── validators/
│       │   │   │   └── auth.validator.ts          ← Request validation
│       │   │   ├── middleware/
│       │   │   │   └── auth.middleware.ts         ← Auth middleware
│       │   │   └── dto/                           ← Data transfer objects
│       │   │
│       │   ├── tutor-service/                     ← Tutor Service (Port 8002)
│       │   │   ├── index.ts
│       │   │   ├── routes/
│       │   │   │   └── tutor.routes.ts
│       │   │   ├── controllers/
│       │   │   │   └── tutor.controller.ts
│       │   │   ├── services/
│       │   │   │   └── tutor.service.ts
│       │   │   ├── validators/
│       │   │   └── middleware/
│       │   │
│       │   ├── booking-service/                   ← Booking Service (Port 8003)
│       │   │   ├── index.ts
│       │   │   ├── routes/
│       │   │   │   └── booking.routes.ts
│       │   │   ├── controllers/
│       │   │   ├── services/
│       │   │   └── validators/
│       │   │
│       │   ├── payment-service/                   ← Payment Service (Port 8004)
│       │   │   ├── index.ts
│       │   │   ├── routes/
│       │   │   ├── controllers/
│       │   │   └── services/
│       │   │
│       │   ├── review-service/                    ← Review Service (Port 8005)
│       │   ├── chat-service/                      ← Chat Service (Port 8006)
│       │   ├── notification-service/              ← Notification Service (Port 8007)
│       │   ├── admin-service/                     ← Admin Service (Port 8008)
│       │   │
│       │   ├── shared/                            ← SHARED UTILITIES
│       │   │   ├── config/
│       │   │   │   └── cors.config.ts             ← CORS CONFIGURATION
│       │   │   ├── middleware/
│       │   │   │   ├── errorHandler.ts            ← Error handler
│       │   │   │   └── asyncHandler.ts            ← Async handler
│       │   │   ├── utils/
│       │   │   │   ├── response.ts                ← RESPONSE WRAPPER
│       │   │   │   ├── logger.ts                  ← Logger utility
│       │   │   │   └── validation.ts              ← Validation helpers
│       │   │   ├── database/                      ← Database connections
│       │   │   ├── redis/                         ← Redis service
│       │   │   ├── rabbitmq/                      ← RabbitMQ service
│       │   │   └── index.ts                       ← Shared exports
│       │   │
│       │   └── index.ts (legacy - not used)
│       │
│       ├── prisma/
│       │   ├── schema.prisma                      ← Database schema
│       │   ├── migrations/                        ← Database migrations
│       │   └── seed.ts                            ← Seed data script
│       │
│       ├── scripts/
│       │   └── setup-database.ts                  ← Database setup
│       │
│       ├── .env.example                           ← Environment template
│       ├── package.json                           ← Backend dependencies
│       ├── Dockerfile                             ← Docker configuration
│       └── tsconfig.json                          ← TypeScript config
│
├── docker-compose.yml                             ← Docker services (DB, Redis, etc.)
├── package.json                                   ← Root workspace config
├── Makefile                                       ← Development commands
└── README.md                                      ← Project documentation
```

---

## 🔑 Key Files for Each Task

### **Task 1: Frontend-Backend Integration**

| File           | Purpose                    | Path                                  |
| -------------- | -------------------------- | ------------------------------------- |
| API Client     | Frontend API configuration | `apps/frontend/src/lib/api-client.ts` |
| Gateway        | API gateway main file      | `apps/backend/src/gateway/index.ts`   |
| Gateway Routes | All proxy routes           | Lines 50-250 in gateway/index.ts      |
| Env Template   | Port configuration         | `apps/backend/.env.example`           |
| Frontend Env   | API URL configuration      | `apps/frontend/.env.example`          |

### **Task 2: CORS Configuration**

| File            | Purpose         | Path                                                |
| --------------- | --------------- | --------------------------------------------------- |
| CORS Config     | CORS settings   | `apps/backend/src/shared/config/cors.config.ts`     |
| Gateway Setup   | CORS in gateway | `apps/backend/src/gateway/index.ts` (line 30)       |
| Auth Service    | CORS in auth    | `apps/backend/src/auth-service/index.ts` (line 25)  |
| Tutor Service   | CORS in tutor   | `apps/backend/src/tutor-service/index.ts` (line 23) |
| Booking Service | CORS in booking | `apps/backend/src/booking-service/index.ts`         |

### **Task 3: Port Configuration**

| File           | Purpose               | Path                                                |
| -------------- | --------------------- | --------------------------------------------------- |
| Gateway Port   | Gateway configuration | `apps/backend/src/gateway/index.ts` (line 13)       |
| Auth Port      | Auth service port     | `apps/backend/src/auth-service/index.ts` (line 22)  |
| Tutor Port     | Tutor service port    | `apps/backend/src/tutor-service/index.ts` (line 22) |
| Booking Port   | Booking service port  | `apps/backend/src/booking-service/index.ts`         |
| Env Template   | All port variables    | `apps/backend/.env.example`                         |
| Docker Compose | Docker port mappings  | `docker-compose.yml`                                |

### **Task 4: Frontend API Requests**

| File         | Purpose                | Path                                         |
| ------------ | ---------------------- | -------------------------------------------- |
| API Client   | Request implementation | `apps/frontend/src/lib/api-client.ts`        |
| Login Page   | Login API call         | `apps/frontend/src/app/auth/login/page.tsx`  |
| Tutor Search | Search API call        | `apps/frontend/src/app/search/page.tsx`      |
| Tutor Detail | Detail API call        | `apps/frontend/src/app/tutors/[id]/page.tsx` |
| Dashboard    | Dashboard API calls    | `apps/frontend/src/app/dashboard/**`         |
| Admin Pages  | Admin API calls        | `apps/frontend/src/app/admin/**`             |

### **Task 5: Gateway Routing**

| File           | Purpose            | Path                                                        |
| -------------- | ------------------ | ----------------------------------------------------------- |
| Gateway Main   | All proxy routes   | `apps/backend/src/gateway/index.ts` (lines 50-250)          |
| Auth Routes    | In auth service    | `apps/backend/src/auth-service/routes/auth.routes.ts`       |
| Tutor Routes   | In tutor service   | `apps/backend/src/tutor-service/routes/tutor.routes.ts`     |
| Booking Routes | In booking service | `apps/backend/src/booking-service/routes/booking.routes.ts` |
| Service URLs   | Service endpoints  | `apps/backend/src/gateway/index.ts` (lines 15-23)           |

### **Task 6: Console Logging**

| File               | Purpose  | Action                                                               |
| ------------------ | -------- | -------------------------------------------------------------------- |
| Auth Routes        | Add logs | `apps/backend/src/auth-service/routes/auth.routes.ts`                |
| Auth Controller    | Add logs | `apps/backend/src/auth-service/controllers/auth.controller.ts`       |
| Tutor Routes       | Add logs | `apps/backend/src/tutor-service/routes/tutor.routes.ts`              |
| Tutor Controller   | Add logs | `apps/backend/src/tutor-service/controllers/tutor.controller.ts`     |
| Booking Routes     | Add logs | `apps/backend/src/booking-service/routes/booking.routes.ts`          |
| Booking Controller | Add logs | `apps/backend/src/booking-service/controllers/booking.controller.ts` |
| Payment Routes     | Add logs | `apps/backend/src/payment-service/routes/**`                         |
| Admin Routes       | Add logs | `apps/backend/src/admin-service/routes/**`                           |

### **Task 7: Response Structure**

| File               | Purpose                  | Path                                                                 |
| ------------------ | ------------------------ | -------------------------------------------------------------------- |
| Response Wrapper   | Standard response format | `apps/backend/src/shared/utils/response.ts`                          |
| Error Handler      | Error response format    | `apps/backend/src/shared/middleware/errorHandler.ts`                 |
| API Client         | Response parsing         | `apps/frontend/src/lib/api-client.ts`                                |
| Auth Controller    | Uses ApiResponse         | `apps/backend/src/auth-service/controllers/auth.controller.ts`       |
| Tutor Controller   | Uses ApiResponse         | `apps/backend/src/tutor-service/controllers/tutor.controller.ts`     |
| Booking Controller | Uses ApiResponse         | `apps/backend/src/booking-service/controllers/booking.controller.ts` |

---

## 🔄 Service Communication Flow

### Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│              Next.js Components (Pages/Components)          │
│                    (apps/frontend/src)                      │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP/REST
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    API CLIENT LAYER                         │
│  Axios Instance with Interceptors (api-client.ts)           │
│         • Request: Add Authorization header                 │
│         • Response: Extract data from wrapper               │
│         • Error: Handle 401, refresh token, etc.            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             │ HTTP Request
                             │ URL: http://localhost:8000/endpoint
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    GATEWAY LAYER (8000)                     │
│           Express App with Proxy Middleware                 │
│         • CORS: Check origin                                │
│         • Route: /auth → :8001, /tutors → :8002             │
│         • Proxy: Forward request to microservice            │
│         • Error: Handle service down scenarios              │
└────────────────────────────┬────────────────────────────────┘
                             │
                  ┌──────────┼──────────┐
                  │          │          │
        ┌─────────▼──┐  ┌────▼──────┐  ┌──────▼──┐
        │  AUTH      │  │  TUTOR    │  │ BOOKING │
        │  :8001     │  │  :8002    │  │  :8003  │
        └─────────┬──┘  └────┬──────┘  └──────┬──┘
                  │          │                │
                  ▼          ▼                ▼
             ┌──────────┬──────────┬──────────────┐
             │ Postgres │ MongoDB  │  Services    │
             │ (Users)  │(Chat,    │  (Redis,     │
             │          │ Reviews) │   RabbitMQ)  │
             └──────────┴──────────┴──────────────┘
```

---

## 📦 Important Utilities & Shared Code

### Response Handling

**File**: `apps/backend/src/shared/utils/response.ts`

```typescript
// Usage in controllers:
ApiResponse.success(res, data, message, 200); // Success
ApiResponse.error(res, message, 400, errors); // Error
ApiResponse.created(res, data, message); // Created (201)
ApiResponse.noContent(res); // No content (204)
```

### Error Handling

**File**: `apps/backend/src/shared/middleware/errorHandler.ts`

All routes use `asyncHandler` to catch errors automatically.

```typescript
// Usage in routes:
router.post('/login', asyncHandler(authController.login));
// Errors are caught and formatted automatically
```

### CORS Configuration

**File**: `apps/backend/src/shared/config/cors.config.ts`

Called in all service files:

```typescript
app.use(cors(getCorsConfig()));
```

### Logger Utility

**File**: `apps/backend/src/shared/utils/logger.ts`

```typescript
const logger = new Logger('ServiceName');
logger.log('Info message'); // console.log
logger.error('Error message'); // console.error
logger.warn('Warning message'); // console.warn
```

---

## 🗂️ Service Structure Template

Each microservice follows this structure:

```
service-name/
├── index.ts              ← Entry point (starts Express app, connects DB)
├── routes/
│   └── service.routes.ts ← Route definitions with middleware
├── controllers/
│   └── service.controller.ts  ← Request handlers, business logic
├── services/
│   └── service.ts        ← Business logic, database operations
├── validators/
│   └── service.validator.ts   ← Input validation (express-validator)
├── middleware/
│   ├── auth.middleware.ts     ← Authentication checking
│   └── upload.middleware.ts   ← File upload handling
├── dto/
│   └── service.dto.ts    ← Data transfer object types
└── __tests__/
    └── service.test.ts   ← Unit tests
```

---

## 🔌 Environment Variables

### Frontend (.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_SOCKET_URL=http://localhost:8007
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
NEXT_PUBLIC_MAPBOX_TOKEN=pk_...
```

### Backend (.env)

```
# Service Ports
GATEWAY_PORT=8000
AUTH_SERVICE_PORT=8001
TUTOR_SERVICE_PORT=8002
BOOKING_SERVICE_PORT=8003
PAYMENT_SERVICE_PORT=8004
REVIEW_SERVICE_PORT=8005
CHAT_SERVICE_PORT=8006
NOTIFICATION_SERVICE_PORT=8007
ADMIN_SERVICE_PORT=8008

# Service URLs (for gateway proxy)
AUTH_SERVICE_URL=http://localhost:8001
TUTOR_SERVICE_URL=http://localhost:8002
BOOKING_SERVICE_URL=http://localhost:8003
# ... etc

# Database
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=tutorgo
POSTGRES_PASSWORD=password
POSTGRES_DB=tutorgo

MONGODB_URI=mongodb://localhost:27017/tutorgo

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=7d

# External Services
STRIPE_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

---

## 🚀 How Services Start

### Running All Services

```bash
npm run dev:backend
# Runs concurrently:
# - Gateway on :8000
# - Auth on :8001
# - Tutor on :8002
# - Booking on :8003
# - Payment on :8004
# - Chat on :8006
# - Notification on :8007
# - Admin on :8008
```

### Service Startup Order

1. **Gateway** starts first, sets up proxy middleware
2. **Each microservice** connects to its database
3. **Services listen** on their respective ports
4. **Gateway** proxies requests to :8001-:8008

### Service Dependencies

- **All services** depend on having databases running (Docker)
- **Gateway** depends on microservices being available
- **Frontend** depends on gateway being available

---

## 📊 Data Flow Examples

### Example: Login Flow

```
1. User enters email/password in frontend
2. Frontend component: apps/frontend/src/app/auth/login/page.tsx
3. Calls: apiClient.post('/auth/login', { email, password })
4. API Client (api-client.ts) sends HTTP POST to http://localhost:8000/auth/login
5. Gateway (gateway/index.ts) receives request at port 8000
6. Gateway checks CORS (cors.config.ts) ✓
7. Gateway proxies to Auth Service at http://localhost:8001/auth/login
8. Auth Route (auth.routes.ts) handles POST /login
9. Auth Controller (auth.controller.ts) validates and processes
10. Auth Service (services/auth.service.ts) queries database
11. Returns { accessToken, refreshToken, user }
12. Wrapped in ApiResponse.success() ✓
13. Sent back to Gateway ✓
14. Gateway forwards to Frontend ✓
15. API Client extracts data from response wrapper ✓
16. Frontend stores token and navigates to dashboard ✓
```

### Example: Search Tutors Flow

```
1. User enters search query in frontend
2. Frontend component: apps/frontend/src/app/search/page.tsx
3. Calls: apiClient.get('/tutors/search?subject=Math&location=NY')
4. API Client sends GET to http://localhost:8000/tutors/search?...
5. Gateway receives and checks CORS ✓
6. Gateway proxies to Tutor Service at http://localhost:8002/tutors/search?...
7. Tutor Route (tutor.routes.ts) handles GET /search
8. Tutor Controller (tutor.controller.ts) processes query
9. Tutor Service queries MongoDB for matching tutors
10. Returns array of tutor objects
11. Wrapped in ApiResponse.success() with data: [tutors...]
12. Sent back through Gateway ✓
13. API Client extracts data (array of tutors)
14. Frontend renders list of tutors ✓
```

---

## 🧪 Testing Key Endpoints

### Test Gateway Health

```bash
curl http://localhost:8000/health
```

### Test Auth Login (via Gateway)

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

### Test Tutor Search (via Gateway)

```bash
curl http://localhost:8000/tutors/search?subject=Math
```

### Direct Service Test (bypassing Gateway)

```bash
curl http://localhost:8001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'
```

---

## 🔍 Finding What You Need

| Question                          | Answer                                | File                                                          |
| --------------------------------- | ------------------------------------- | ------------------------------------------------------------- |
| How does frontend call backend?   | Uses axios ApiClient                  | `apps/frontend/src/lib/api-client.ts`                         |
| What's the base API URL?          | `http://localhost:8000`               | `apps/frontend/.env.example`                                  |
| Where's CORS configured?          | Shared config applied to all services | `apps/backend/src/shared/config/cors.config.ts`               |
| What port does gateway listen on? | 8000 (or 3001, check .env)            | `apps/backend/src/gateway/index.ts`                           |
| What port does auth service use?  | 8001                                  | `apps/backend/src/auth-service/index.ts`                      |
| How are responses formatted?      | Via ApiResponse utility               | `apps/backend/src/shared/utils/response.ts`                   |
| Where's the login route?          | In auth service                       | `apps/backend/src/auth-service/routes/auth.routes.ts`         |
| Where's the tutor search route?   | In tutor service                      | `apps/backend/src/tutor-service/routes/tutor.routes.ts`       |
| How's authentication handled?     | JWT token in Authorization header     | `apps/backend/src/auth-service/middleware/auth.middleware.ts` |
| Where are errors handled?         | Shared error middleware               | `apps/backend/src/shared/middleware/errorHandler.ts`          |

---

**Last Updated**: December 8, 2025  
**For Use With**: `tasks.md`, `TASKS_QUICK_START.md`, `API_ENDPOINTS_REFERENCE.md`
