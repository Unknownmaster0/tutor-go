# Design System Documentation

## Overview

The Tutor-Go design system provides a comprehensive set of UI components, color tokens, typography, and spacing utilities to ensure visual consistency across the application.

---

## Table of Contents

1. [Color Palette](#color-palette)
2. [Typography](#typography)
3. [Spacing & Layout](#spacing--layout)
4. [Components](#components)
5. [Usage Guidelines](#usage-guidelines)
6. [Accessibility](#accessibility)
7. [Best Practices](#best-practices)

---

## Color Palette

### Primary Colors

The primary color palette is used for main actions, links, and key interface elements.

#### Primary 500 (Main)

```css
--color-primary-500: rgb(14, 165, 233) HEX: #0ea5e9;
```

**Usage**: Primary buttons, active links, focus states
**Contrast**: 4.54:1 on white ✅ WCAG AA

#### Primary 600 (Hover)

```css
--color-primary-600: rgb(2, 132, 199) HEX: #0284c7;
```

**Usage**: Button hover states, secondary interactions
**Contrast**: 6.84:1 on white ✅ WCAG AAA

#### Primary 700 (Active)

```css
--color-primary-700: rgb(3, 105, 161) HEX: #0369a1;
```

**Usage**: Button active/pressed states
**Contrast**: 9.24:1 on white ✅ WCAG AAA

### Secondary Colors

Used for alternative actions and emphasis.

#### Secondary 500 (Main)

```css
--color-secondary-500: rgb(168, 85, 247) HEX: #a855f7;
```

**Usage**: Secondary buttons, highlights
**Note**: Use Secondary 600+ for text due to contrast

#### Secondary 600 (Hover)

```css
--color-secondary-600: rgb(147, 51, 234) HEX: #9333ea;
```

**Usage**: Secondary button hover, better contrast for text
**Contrast**: 4.65:1 on white ✅ WCAG AA

### Neutral Colors

Grayscale palette for text, borders, and backgrounds.

```
Neutral 50:   #F9FAFB (backgrounds)
Neutral 100:  #F3F4F6 (light backgrounds)
Neutral 200:  #E5E7EB (borders)
Neutral 300:  #D1D5DB (borders)
Neutral 400:  #9CA3AF (disabled text)
Neutral 500:  #6B7280 (secondary text)
Neutral 600:  #4B5563 (secondary text)
Neutral 700:  #374151 (body text)
Neutral 800:  #1F2937 (secondary headings)
Neutral 900:  #111827 (primary text)
```

### Status Colors

#### Success

```css
--color-success: rgb(16, 185, 129) HEX: #10b981;
```

**Usage**: Successful states, confirmations, completed actions

#### Warning

```css
--color-warning: rgb(245, 158, 11) HEX: #f59e0b;
```

**Usage**: Warnings, pending states, caution messages

#### Error

```css
--color-error: rgb(239, 68, 68) HEX: #ef4444;
```

**Usage**: Errors, destructive actions, validation failures

---

## Typography

### Font Stack

```css
font-family:
  'Inter',
  system-ui,
  -apple-system,
  sans-serif;
```

### Heading Styles

#### H1 (Display)

```css
font-size: 2.25rem (36px)
font-weight: 700
line-height: 2.5rem (40px)
letter-spacing: -0.02em
```

**Usage**: Page titles, major headings
**Example**: Dashboard title

#### H2 (Large Heading)

```css
font-size: 1.875rem (30px)
font-weight: 600
line-height: 2.25rem (36px)
letter-spacing: -0.01em
```

**Usage**: Section headings
**Example**: "Available Teachers", "Booking History"

#### H3 (Medium Heading)

```css
font-size: 1.5rem (24px)
font-weight: 600
line-height: 2rem (32px)
```

**Usage**: Component titles, subsection headings

#### H4 (Small Heading)

```css
font-size: 1.125rem (18px)
font-weight: 600
line-height: 1.75rem (28px)
```

**Usage**: Card titles, component headers

### Body Text

#### Body Large

```css
font-size: 1rem (16px)
font-weight: 400
line-height: 1.5rem (24px)
```

**Usage**: Main body text, descriptions

#### Body Regular

```css
font-size: 0.9375rem (15px)
font-weight: 400
line-height: 1.5rem (24px)
```

**Usage**: Default text, form labels

#### Body Small

```css
font-size: 0.875rem (14px)
font-weight: 400
line-height: 1.25rem (20px)
```

**Usage**: Helper text, secondary information, timestamps

#### Body Extra Small

```css
font-size: 0.75rem (12px)
font-weight: 400
line-height: 1rem (16px)
```

**Usage**: Captions, badges, fine print

---

## Spacing & Layout

### Spacing Scale

Based on a 4px base unit:

```
0: 0px
1: 4px
2: 8px
3: 12px
4: 16px
5: 20px
6: 24px
7: 28px
8: 32px
9: 36px
10: 40px
12: 48px
16: 64px
20: 80px
24: 96px
```

### Padding & Margins

#### Component Padding

- **Cards**: p-6 (24px)
- **Buttons**: px-4 py-2 (16px × 8px)
- **Input fields**: px-4 py-2 (16px × 8px)
- **Sections**: py-8 (32px vertical)

#### Margins

- **Section gap**: gap-8 (32px)
- **Component gap**: gap-6 (24px)
- **Item spacing**: gap-4 (16px)

### Responsive Breakpoints

```
sm: 640px   (small devices)
md: 768px   (tablets)
lg: 1024px  (desktops)
xl: 1280px  (large desktops)
2xl: 1536px (extra large)
```

**Example Grid Layout**:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Single column on mobile, 2 on tablet, 3 on desktop */}
</div>
```

---

## Components

### Button Component

#### Variants

**Primary Button** (Default)

```tsx
<Button variant="primary">Click me</Button>
```

- Background: Primary 500
- Hover: Primary 600
- Active: Primary 700

**Secondary Button**

```tsx
<Button variant="secondary">Alternative action</Button>
```

- Background: Secondary 500
- Hover: Secondary 600
- Active: Secondary 700

**Ghost Button**

```tsx
<Button variant="ghost">Optional action</Button>
```

- Background: Transparent
- Hover: Neutral 100
- Active: Neutral 200

#### Sizes

```tsx
<Button size="sm">Small</Button>
<Button size="md">Medium (default)</Button>
<Button size="lg">Large</Button>
```

#### States

```tsx
// Loading state
<Button loading>Processing...</Button>

// Disabled state
<Button disabled>Disabled</Button>

// With icon
<Button>
  <Icon /> Click me
</Button>
```

### Card Component

```tsx
import { Card } from '@/components/ui/Card';

<Card hover>
  <h3>Card Title</h3>
  <p>Card content goes here</p>
</Card>;
```

**Props**:

- `hover`: boolean - Add hover lift effect
- `className`: string - Additional Tailwind classes

### Input Component

```tsx
import { Input } from '@/components/ui/Input';

<Input
  label="Email"
  type="email"
  placeholder="your@email.com"
  error={error}
  helperText="We'll never share your email"
/>;
```

**Props**:

- `label`: string - Input label
- `error`: string - Error message
- `success`: boolean - Success state
- `helperText`: string - Helper text
- All standard HTML input attributes

### LoadingSpinner Component

```tsx
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

<LoadingSpinner size="md" variant="primary" />;
```

**Sizes**: sm, md, lg
**Variants**: primary, secondary, success, white

### SkeletonLoader Component

```tsx
import { SkeletonLoader } from '@/components/ui/SkeletonLoader';

<SkeletonLoader variant="card" />
<SkeletonLoader variant="text" />
<SkeletonLoader variant="input" />
```

**Variants**: card, text, input, avatar, line

---

## Usage Guidelines

### Button Usage

✅ **DO**

```tsx
// Use semantic button labels
<Button>Save Changes</Button>
<Button variant="secondary">Cancel</Button>

// Handle loading states
<Button loading={isSubmitting}>Submit</Button>

// Disable when invalid
<Button disabled={!isFormValid}>Continue</Button>
```

❌ **DON'T**

```tsx
// Avoid generic labels
<Button>OK</Button>
<Button>Submit</Button>

// Don't use buttons for navigation (use links)
<Button onClick={() => router.push('/page')}>Go to page</Button>
```

### Color Usage

✅ **DO**

```tsx
// Use semantic colors
<div className="bg-success/10 text-success">Success message</div>
<div className="bg-error/10 text-error">Error message</div>

// Use proper contrast
<button className="bg-primary-600 text-white">Good contrast</button>
```

❌ **DON'T**

```tsx
// Avoid arbitrary colors
<div className="bg-purple-500">Random color</div>

// Don't use primary color for text alone (insufficient contrast)
<div className="text-primary-500">Insufficient contrast on white</div>
```

### Layout Best Practices

✅ **DO**

```tsx
// Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Use consistent spacing
<div className="space-y-6">

// Mobile-first approach
<div className="flex flex-col lg:flex-row gap-6">
```

❌ **DON'T**

```tsx
// Fixed widths (not responsive)
<div className="w-500">Fixed width</div>

// Inconsistent spacing
<div style={{ marginTop: '20px', padding: '15px' }}>

// Desktop-first
<div className="flex lg:flex-col">
```

---

## Accessibility

### Keyboard Navigation

All interactive components support:

- **Tab**: Navigate to element
- **Enter/Space**: Activate element
- **Escape**: Close modals/dropdowns
- **Arrow keys**: Navigate lists/menus

### Screen Reader Support

```tsx
// Provide aria-labels
<button aria-label="Close dialog">×</button>

// Link form inputs to labels
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Use semantic HTML
<nav aria-label="Main navigation">
<main id="main-content">
<article>
<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
</section>
```

### Focus Management

- All components have visible focus rings
- Focus outline: 3px solid primary-500 with 2px offset
- Tab order follows logical document flow

---

## Best Practices

### Performance

1. **Use Next.js Image component**

   ```tsx
   import Image from 'next/image';
   <Image src={url} alt="description" width={64} height={64} />;
   ```

2. **Lazy load components**

   ```tsx
   const HeavyComponent = dynamic(() => import('./Heavy'));
   ```

3. **Optimize re-renders**
   ```tsx
   const MemoizedComponent = React.memo(Component);
   ```

### Maintainability

1. **Keep components focused** - Single responsibility
2. **Use TypeScript** - Type safety
3. **Document props** - JSDoc comments
4. **Consistent naming** - PascalCase for components

### Consistency

1. **Follow the design system** - No custom colors/sizes
2. **Use design tokens** - CSS custom properties
3. **Test across browsers** - Chrome, Firefox, Safari, Edge
4. **Test on devices** - Mobile, tablet, desktop

---

## Component Examples

### TeacherCard

```tsx
import { TeacherCard } from '@/components/dashboard';
import { Teacher } from '@/types/dashboard.types';

<TeacherCard
  teacher={{
    id: '1',
    name: 'John Doe',
    subjects: ['Mathematics', 'Physics'],
    hourlyRate: 50,
    rating: 4.5,
    totalReviews: 12,
  }}
  onClick={(teacherId) => router.push(`/tutors/${teacherId}`)}
/>;
```

### TeacherList

```tsx
import { TeacherList } from '@/components/dashboard';

<TeacherList
  teachers={teachers}
  isLoading={loading}
  onTeacherClick={(id) => handleTeacherClick(id)}
/>;
```

### Dashboard Layout

```tsx
import { DashboardLayout } from '@/components/dashboard';

<DashboardLayout>
  <h1>My Dashboard</h1>
  {/* Content */}
</DashboardLayout>;
```

---

## Responsive Design

### Mobile (≤640px)

- Single column layout
- Full-width components
- Simplified navigation
- Touch-friendly targets (min 44px)

### Tablet (641-1024px)

- Two-column layout
- Medium components
- Expanded navigation
- Balanced spacing

### Desktop (≥1025px)

- Three+ column layout
- Full component ecosystem
- Complete features
- Optimized spacing

---

## Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Web.dev Performance](https://web.dev/performance/)

---

## Version History

- **v1.0.0** (December 2025)
  - Initial design system
  - Core components
  - Color palette
  - Typography system
  - Accessibility compliance (WCAG 2.1 AA)

---

## Support

For questions or issues with the design system:

1. Check this documentation
2. Review existing components in `src/components/ui/`
3. Check design system tests in `src/__tests__/components/ui/`
4. Contact the frontend team

---

## Document Information

- **Last Updated**: December 2025
- **Status**: Active
- **Compliance**: WCAG 2.1 AA
- **Framework**: Next.js 14, React 18, Tailwind CSS 3
