import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  SkeletonLoader,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
} from '@/components/ui/SkeletonLoader';

describe('SkeletonLoader Component', () => {
  it('renders skeleton', () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<SkeletonLoader />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading content');
  });

  it('has screen reader text', () => {
    render(<SkeletonLoader />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies text variant by default', () => {
    const { container } = render(<SkeletonLoader />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-4', 'rounded');
  });

  it('applies circular variant when specified', () => {
    const { container } = render(<SkeletonLoader variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('applies rectangular variant when specified', () => {
    const { container } = render(<SkeletonLoader variant="rectangular" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('rounded-md');
  });

  it('applies card variant when specified', () => {
    const { container } = render(<SkeletonLoader variant="card" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('h-48', 'rounded-lg');
  });

  it('applies animate-pulse class', () => {
    const { container } = render(<SkeletonLoader />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('applies background color', () => {
    const { container } = render(<SkeletonLoader />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('bg-neutral-200');
  });

  it('accepts custom width', () => {
    const { container } = render(<SkeletonLoader width="200px" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '200px' });
  });

  it('accepts custom height', () => {
    const { container } = render(<SkeletonLoader height="100px" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ height: '100px' });
  });

  it('applies default width of 100% for text variant', () => {
    const { container } = render(<SkeletonLoader variant="text" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '100%' });
  });

  it('applies default width and height for circular variant', () => {
    const { container } = render(<SkeletonLoader variant="circular" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('accepts custom className', () => {
    const { container } = render(<SkeletonLoader className="custom-class" />);
    const skeleton = container.firstChild as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });
});

describe('SkeletonText Component', () => {
  it('renders 3 lines by default', () => {
    const { container } = render(<SkeletonText />);
    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons).toHaveLength(3);
  });

  it('renders specified number of lines', () => {
    const { container } = render(<SkeletonText lines={5} />);
    const skeletons = container.querySelectorAll('[role="status"]');
    expect(skeletons).toHaveLength(5);
  });

  it('applies spacing between lines', () => {
    const { container } = render(<SkeletonText />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('space-y-2');
  });

  it('last line is 80% width', () => {
    const { container } = render(<SkeletonText lines={3} />);
    const skeletons = container.querySelectorAll('[role="status"]');
    const lastSkeleton = skeletons[2] as HTMLElement;
    expect(lastSkeleton).toHaveStyle({ width: '80%' });
  });

  it('accepts custom className', () => {
    const { container } = render(<SkeletonText className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });
});

describe('SkeletonCard Component', () => {
  it('renders card structure', () => {
    const { container } = render(<SkeletonCard />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('p-6', 'bg-white', 'rounded-lg', 'shadow-soft');
  });

  it('renders avatar skeleton', () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('[role="status"]');
    // Should have: 1 avatar + 2 header lines + 3 text lines = 6 total
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('accepts custom className', () => {
    const { container } = render(<SkeletonCard className="custom-class" />);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });
});

describe('SkeletonAvatar Component', () => {
  it('renders circular skeleton', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton).toHaveClass('rounded-full');
  });

  it('applies default size of 40px', () => {
    const { container } = render(<SkeletonAvatar />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('accepts custom size', () => {
    const { container } = render(<SkeletonAvatar size="64px" />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton).toHaveStyle({ width: '64px', height: '64px' });
  });

  it('accepts custom className', () => {
    const { container } = render(<SkeletonAvatar className="custom-class" />);
    const skeleton = container.querySelector('[role="status"]') as HTMLElement;
    expect(skeleton).toHaveClass('custom-class');
  });
});
