# TutorGo Frontend

Next.js frontend application for the TutorGo platform.

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages (login, register)
│   ├── dashboard/         # Protected dashboard pages
│   └── layout.tsx         # Root layout with providers
├── components/            # Reusable React components
│   └── auth/             # Authentication-related components
├── contexts/             # React contexts (AuthContext)
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and API client
├── types/                # TypeScript type definitions
└── __tests__/           # Test files
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=http://localhost:3006
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Testing

```bash
# Run tests once
npm test

# Run tests in watch mode
npm run test:watch
```

### Build

```bash
npm run build
npm start
```

## Authentication

The app uses JWT-based authentication with the following features:

### AuthContext

Provides authentication state and methods throughout the app:

```tsx
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  // Use authentication state and methods
}
```

### Protected Routes

Use the `ProtectedRoute` component to protect pages:

```tsx
import { ProtectedRoute } from '@/components/auth';

export default function DashboardPage() {
  return (
    <ProtectedRoute allowedRoles={['student']}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

Or use the `withAuth` HOC:

```tsx
import { withAuth } from '@/components/auth';

function DashboardPage() {
  return <div>Dashboard</div>;
}

export default withAuth(DashboardPage, { allowedRoles: ['student'] });
```

### Role-Based Access

Three user roles are supported:

- `student` - Can search and book tutors
- `tutor` - Can manage profile and availability
- `admin` - Can access admin dashboard

## API Client

The API client handles authentication tokens automatically:

```tsx
import { apiClient } from '@/lib/api-client';

// Automatically includes auth token
const data = await apiClient.get('/tutors/search');
```

## Key Features

- ✅ JWT authentication with automatic token refresh
- ✅ Role-based access control
- ✅ Protected routes
- ✅ Form validation
- ✅ Responsive design with Tailwind CSS
- ✅ TypeScript for type safety
- ✅ Component testing with Vitest

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Context
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library
- **Real-time**: Socket.io Client (for chat)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
