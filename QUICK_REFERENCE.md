# Quick Reference Guide - TutorGo Frontend Development

**Last Updated**: December 9, 2025  
**For**: Developers implementing TutorGo frontend features

---

## 🚀 Quick Start (5 minutes)

### 1. Setup Environment

```bash
# Clone latest code
git checkout feat/adding-frontend-features

# Install dependencies
cd apps/frontend
npm install

# Setup environment file
cp .env.example .env.local
```

### 2. Configure .env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_APP_ENV=development
```

### 3. Run Development Server

```bash
# Terminal 1: Backend
cd apps/backend && npm run dev

# Terminal 2: Frontend
cd apps/frontend && npm run dev
```

**Frontend available at**: `http://localhost:3000`  
**API Gateway available at**: `http://localhost:8000`

---

## 📋 10-Task Checklist

- [ ] Task 1: User Registration & Authentication (4-5 hrs)
- [ ] Task 2: Tutor Profile Management (6-8 hrs)
- [ ] Task 3: Location-Based Search + Google Maps (7-9 hrs)
- [ ] Task 4: Tutor Profile Viewing (5-6 hrs)
- [ ] Task 5: Session Booking (6-7 hrs)
- [ ] Task 6: Real-Time Chat (5-6 hrs)
- [ ] Task 7: Review & Rating System (4-5 hrs)
- [ ] Task 8: Tutor Availability Management (5-6 hrs)
- [ ] Task 9: Admin Dashboard (8-10 hrs)
- [ ] Task 10: Session History & Management (4-5 hrs)

---

## 🔗 API Integration Quick Reference

### Authentication Endpoints

```
POST   /api/auth/register          → Create user account
POST   /api/auth/login             → User login (returns JWT)
POST   /api/auth/refresh           → Refresh expired token
POST   /api/auth/forgot-password   → Request password reset
POST   /api/auth/reset-password    → Reset password
GET    /api/auth/me                → Get current user (protected)
POST   /api/auth/logout            → Logout user (protected)
```

### Tutor Endpoints

```
GET    /api/tutors                 → List all tutors
GET    /api/tutors/:id             → Get tutor profile
GET    /api/tutors/me              → Get current tutor (protected)
PUT    /api/tutors/me              → Update profile (protected)
POST   /api/tutors/:id/videos      → Upload demo video
GET    /api/tutors/:id/videos      → Get videos
POST   /api/tutors/search          → Search tutors by location
```

### Booking Endpoints

```
POST   /api/bookings               → Create booking (protected)
GET    /api/bookings               → List user bookings (protected)
GET    /api/bookings/:id           → Get booking details
PATCH  /api/bookings/:id/confirm   → Confirm booking (protected)
PATCH  /api/bookings/:id/cancel    → Cancel booking (protected)
GET    /api/availability           → Get time slots
```

### Payment Endpoints

```
POST   /api/payments               → Process payment (protected)
GET    /api/payments/:id           → Get payment details
PATCH  /api/payments/:id/refund    → Request refund (protected)
```

### Review Endpoints

```
POST   /api/reviews                → Submit review (protected)
GET    /api/reviews/tutor/:id      → Get tutor reviews
PATCH  /api/reviews/:id            → Update review (protected)
DELETE /api/reviews/:id            → Delete review (protected)
POST   /api/reviews/:id/flag       → Flag inappropriate content
```

### Chat Endpoints

```
GET    /api/chat/conversations     → List conversations (protected)
GET    /api/chat/conversations/:id/messages
                                   → Get message history
POST   /api/chat/messages          → Send message (via Socket.io)
PATCH  /api/chat/messages/:id/read → Mark as read
```

### Notification Endpoints

```
GET    /api/notifications          → List notifications (protected)
PATCH  /api/notifications/:id/read → Mark as read
```

---

## 🏗️ Component Creation Template

### Typical Component Structure

```typescript
'use client'; // If using client-side features

import { FC } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ComponentProps {
  title: string;
  onSubmit?: (data: any) => void;
}

export const YourComponent: FC<ComponentProps> = ({ title, onSubmit }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async () => {
    try {
      setLoading(true);
      // Your logic here
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div>Please login</div>;

  return (
    <div>
      <h1>{title}</h1>
      {error && <div className="text-red-600">{error}</div>}
      {/* Component JSX */}
    </div>
  );
};
```

---

## 🎣 Custom Hook Template

### Pattern for API Hooks

```typescript
// hooks/useFeature.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/lib/api-client';

export const useFeature = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/endpoint/${id}`);
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: any) => {
    setLoading(true);
    try {
      const response = await apiClient.post('/api/endpoint', payload);
      setData(response.data);
      return response.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetch, create };
};
```

---

## 📁 File Organization Guide

### When Creating a New Feature

```
1. Create page directory: apps/frontend/src/app/feature/page.tsx
2. Create components: apps/frontend/src/components/feature/*.tsx
3. Create hooks: apps/frontend/src/hooks/useFeature.ts
4. Create types: apps/frontend/src/types/feature.ts
5. Create tests: apps/frontend/src/__tests__/feature.test.tsx
```

### Component File Naming

- Pages: `page.tsx`
- Components: `PascalCase.tsx`
- Hooks: `useFeatureName.ts`
- Types: `featureName.ts`
- Utils: `featureUtils.ts`

---

## 🎨 Tailwind CSS Quick Classes

### Common Patterns

```typescript
// Layout
<div className="flex justify-center items-center">    {/* Centered */}
<div className="grid grid-cols-3 gap-4">               {/* 3-column grid */}
<div className="flex flex-col space-y-4">             {/* Vertical stack */}

// Sizing
<div className="w-full h-screen">                      {/* Full screen */}
<div className="max-w-2xl mx-auto">                   {/* Centered max-width */}
<button className="px-6 py-2">                        {/* Padding */}

// Colors
<div className="bg-blue-600 text-white">             {/* Colors */}
<button className="hover:bg-blue-700">               {/* Hover */}

// Typography
<h1 className="text-3xl font-bold">                  {/* Heading */}
<p className="text-gray-600">                        {/* Body text */}

// Responsive
<div className="md:grid-cols-2 lg:grid-cols-3">      {/* Responsive cols */}
<button className="hidden md:block">                 {/* Hidden on mobile */}
```

---

## 🔐 Authentication Pattern

### Protected Page Example

```typescript
'use client';

import { useAuth } from '@/hooks/useAuth';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) redirect('/login');

  return (
    <div>
      <h1>Welcome, {user.name}</h1>
    </div>
  );
}
```

### API Call with Auth

```typescript
// Token is automatically added by axios interceptor in api-client.ts
const response = await apiClient.get('/api/protected-endpoint');
```

---

## 🧪 Testing Patterns

### Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('renders correctly', () => {
    render(<YourComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Hook Test

```typescript
import { renderHook, act } from '@testing-library/react';
import { useFeature } from '@/hooks/useFeature';

describe('useFeature', () => {
  it('fetches data', async () => {
    const { result } = renderHook(() => useFeature());

    await act(async () => {
      await result.current.fetch('123');
    });

    expect(result.current.data).toBeDefined();
  });
});
```

---

## 🐛 Debugging Tips

### Enable Request Logging

```typescript
// In lib/api-client.ts
this.client.interceptors.request.use((config) => {
  console.log('[API Request]', config.method?.toUpperCase(), config.url);
  return config;
});

this.client.interceptors.response.use((response) => {
  console.log('[API Response]', response.status, response.data);
  return response;
});
```

### Browser DevTools

- **Network**: Check API requests/responses
- **Storage**: Verify JWT token is stored
- **Console**: Check for errors/warnings
- **React DevTools**: Inspect component tree

### Common Issues

```
1. CORS Error → Check API Gateway CORS config
2. 401 Unauthorized → Token missing or expired
3. 404 Not Found → Check API endpoint path
4. Blank page → Check browser console for errors
```

---

## 📚 Key Documentation Files

| Document                    | Purpose                | Location     |
| --------------------------- | ---------------------- | ------------ |
| IMPLEMENTATION_TASKS.md     | Detailed feature specs | Root         |
| GOOGLE_MAPS_INTEGRATION.md  | Maps setup guide       | Root         |
| FRONTEND_PHASE_1_SUMMARY.md | Overview & roadmap     | Root         |
| API_ENDPOINTS_REFERENCE.md  | Complete API docs      | Root         |
| Backend README              | Service details        | apps/backend |

---

## 🔗 Useful Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [React Hooks](https://react.dev/reference/react/hooks)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Axios](https://axios-http.com/docs/intro)

### External APIs

- [Google Maps API](https://developers.google.com/maps/documentation/javascript)
- [Stripe API](https://stripe.com/docs/api)
- [Socket.io](https://socket.io/docs/v4/client-api/)
- [Cloudinary](https://cloudinary.com/documentation)

---

## 💡 Best Practices

### Code Quality

- ✅ Use TypeScript for type safety
- ✅ Break components into smaller pieces
- ✅ Use custom hooks for logic reuse
- ✅ Keep components pure and testable

### Performance

- ✅ Use React.memo for expensive components
- ✅ Lazy load routes with dynamic imports
- ✅ Optimize images and videos
- ✅ Cache API responses appropriately

### Security

- ✅ Never hardcode API keys (use env vars)
- ✅ Validate user input on both client and server
- ✅ Use HTTPS in production
- ✅ Implement proper CORS headers

### Testing

- ✅ Write unit tests for utilities
- ✅ Write integration tests for hooks
- ✅ Test user interactions in components
- ✅ Aim for >80% code coverage

---

## 🚦 Development Workflow

### Creating a New Feature

```bash
# 1. Create feature branch
git checkout -b feat/feature-name

# 2. Implement components
# - Create page.tsx
# - Create components
# - Create hooks
# - Create types

# 3. Test locally
npm run dev
# Visit http://localhost:3000/feature

# 4. Run tests
npm run test

# 5. Commit changes
git add .
git commit -m "feat: add feature-name"

# 6. Push and create PR
git push origin feat/feature-name
```

### Code Review Checklist

- [ ] TypeScript strict mode passes
- [ ] No console errors/warnings
- [ ] Components are properly typed
- [ ] API calls use error handling
- [ ] Tests written and passing
- [ ] Responsive design tested
- [ ] Accessibility checked

---

## 📱 Mobile Testing

### Test Responsive Design

```bash
# Browser DevTools
1. Press F12
2. Click device toggle (Ctrl+Shift+M)
3. Test on iPhone 12, iPad, Android

# Or use actual devices
npm run dev  # Accessible on local network
# Visit http://YOUR_IP:3000
```

---

## 🆘 Getting Help

### Check These First

1. Error message in browser console
2. Backend service is running (`npm run dev` in backend)
3. Environment variables are set in `.env.local`
4. API endpoint paths are correct

### Debugging Steps

```
1. Check network requests in DevTools
2. Log data to console
3. Use React DevTools extension
4. Check backend logs
5. Verify database data
```

---

## 📊 Progress Tracking

### Tasks Completed: \_\_\_/10

### Estimated Timeline

- Week 1: Tasks 1-2 (Auth + Profile)
- Week 2: Tasks 3-4 (Search + Viewing)
- Week 3: Tasks 5-6 (Booking + Chat)
- Week 4: Tasks 7-8 (Reviews + Availability)
- Week 5: Tasks 9-10 (Admin + History)

**Total Estimated**: 5-6 weeks for full implementation

---

## 📝 Version History

| Version | Date        | Changes         |
| ------- | ----------- | --------------- |
| 1.0     | Dec 9, 2025 | Initial release |

---

**Last Updated**: December 9, 2025  
**Status**: ✅ Ready for Development
