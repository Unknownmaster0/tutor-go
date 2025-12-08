# Shared UI Component Library

This directory contains reusable UI components that follow the design system established in the TutorGo frontend.

## Components

### Button

A versatile button component with multiple variants and states.

**Features:**

- Variants: `primary`, `secondary`, `ghost`
- Loading state with spinner
- Disabled state
- Fully accessible with proper ARIA attributes

**Usage:**

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" onClick={handleClick}>
  Click me
</Button>

<Button variant="secondary" loading>
  Loading...
</Button>
```

### Card

A container component for consistent card styling across the application.

**Features:**

- Soft shadow and rounded corners
- Optional hover effect with shadow transition
- Flexible content support

**Usage:**

```tsx
import { Card } from '@/components/ui';

<Card hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>;
```

### Input

A form input component with validation states and accessibility features.

**Features:**

- Label support with auto-generated IDs
- Error and success states
- Helper text
- Full accessibility with ARIA attributes
- Focus states

**Usage:**

```tsx
import { Input } from '@/components/ui';

<Input
  label="Email"
  type="email"
  error="Invalid email address"
/>

<Input
  label="Username"
  helperText="Choose a unique username"
  success
/>
```

### LoadingSpinner

An animated loading spinner for indicating loading states.

**Features:**

- Multiple sizes: `sm`, `md`, `lg`
- Color variants: `primary`, `secondary`, `white`
- Smooth animation
- Accessible with screen reader support

**Usage:**

```tsx
import { LoadingSpinner } from '@/components/ui';

<LoadingSpinner size="md" color="primary" />;
```

### SkeletonLoader

Skeleton loading components for better perceived performance.

**Features:**

- Multiple variants: `text`, `circular`, `rectangular`, `card`
- Preset components: `SkeletonText`, `SkeletonCard`, `SkeletonAvatar`
- Customizable width and height
- Smooth pulse animation

**Usage:**

```tsx
import {
  SkeletonLoader,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar
} from '@/components/ui';

// Basic skeleton
<SkeletonLoader variant="rectangular" width="200px" height="100px" />

// Text skeleton with multiple lines
<SkeletonText lines={3} />

// Card skeleton
<SkeletonCard />

// Avatar skeleton
<SkeletonAvatar size="48px" />
```

## Design System Integration

All components use the design system colors and styles defined in:

- `tailwind.config.js` - Custom color palette and theme extensions
- `globals.css` - CSS custom properties for theming

### Color Palette

- **Primary**: Blue tones for main actions
- **Secondary**: Purple tones for secondary actions
- **Neutral**: Gray scale for text and backgrounds
- **Success**: Green for positive feedback
- **Warning**: Orange for warnings
- **Error**: Red for errors

### Accessibility

All components follow WCAG 2.1 AA standards:

- Proper ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios of 4.5:1 minimum

## Testing

All components have comprehensive unit tests with 100% coverage:

- Component rendering
- Props and variants
- User interactions
- Accessibility features
- Edge cases

Run tests:

```bash
npm test -- src/__tests__/components/ui --run
```

## Future Enhancements

Potential additions to the component library:

- Modal/Dialog component
- Dropdown/Select component
- Checkbox and Radio components
- Badge component
- Alert/Toast component (using react-hot-toast)
- Tabs component
- Tooltip component
