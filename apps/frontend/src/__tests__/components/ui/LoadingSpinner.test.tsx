import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders spinner', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has accessible label', () => {
    render(<LoadingSpinner />);
    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading');
  });

  it('has screen reader text', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('applies medium size by default', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-8', 'w-8');
  });

  it('applies small size when specified', () => {
    const { container } = render(<LoadingSpinner size="sm" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-4', 'w-4');
  });

  it('applies large size when specified', () => {
    const { container } = render(<LoadingSpinner size="lg" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12');
  });

  it('applies primary color by default', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-primary-500');
  });

  it('applies secondary color when specified', () => {
    const { container } = render(<LoadingSpinner color="secondary" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-secondary-500');
  });

  it('applies white color when specified', () => {
    const { container } = render(<LoadingSpinner color="white" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('text-white');
  });

  it('applies animate-spin class', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('animate-spin');
  });

  it('accepts custom className', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('renders SVG with correct viewBox', () => {
    const { container } = render(<LoadingSpinner />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
  });

  it('combines size and color classes correctly', () => {
    const { container } = render(<LoadingSpinner size="lg" color="secondary" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveClass('h-12', 'w-12', 'text-secondary-500');
  });
});
