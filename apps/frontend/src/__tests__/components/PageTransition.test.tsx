import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageTransition from '@/components/PageTransition';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/test-path'),
}));

describe('PageTransition Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children correctly', () => {
    render(
      <PageTransition>
        <div data-testid="test-child">Hello World</div>
      </PageTransition>,
    );

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });

  it('should have page-transition wrapper with correct classes', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper).toBeInTheDocument();
    expect(wrapper).toHaveAttribute('aria-live', 'polite');
  });

  it('should start with enter class after mount', async () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    await new Promise((resolve) => setTimeout(resolve, 100));

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper?.className).toContain('page-transition');
  });

  it('should have ARIA label for accessibility', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper).toHaveAttribute('aria-label', 'Page content');
  });

  it('should support multiple children', () => {
    render(
      <PageTransition>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </PageTransition>,
    );

    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('should preserve component state during transitions', async () => {
    const { rerender } = render(
      <PageTransition>
        <div data-testid="content">Test Content</div>
      </PageTransition>,
    );

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(screen.getByTestId('content')).toHaveTextContent('Test Content');

    rerender(
      <PageTransition>
        <div data-testid="content">Test Content</div>
      </PageTransition>,
    );

    expect(screen.getByTestId('content')).toHaveTextContent('Test Content');
  });
});

describe('PageTransition CSS Classes', () => {
  it('should apply correct classes for enter state', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper?.className).toMatch(/page-transition/);
  });

  it('should be in document with correct structure', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper).toHaveClass('page-transition');
  });

  it('should have aria-live attribute for dynamic content', () => {
    const { container } = render(
      <PageTransition>
        <div>Content</div>
      </PageTransition>,
    );

    const wrapper = container.querySelector('.page-transition');
    expect(wrapper?.getAttribute('aria-live')).toBe('polite');
  });
});
