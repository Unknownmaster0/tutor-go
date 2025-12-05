import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Card } from '@/components/ui/Card';

describe('Card Component', () => {
  it('renders with children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('applies base styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('bg-white', 'rounded-lg', 'shadow-soft', 'p-6');
  });

  it('applies hover styles when hover prop is true', () => {
    const { container } = render(<Card hover>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('hover:shadow-medium', 'cursor-pointer');
  });

  it('does not apply hover styles when hover prop is false', () => {
    const { container } = render(<Card hover={false}>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('hover:shadow-medium');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('does not apply hover styles by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).not.toHaveClass('hover:shadow-medium');
    expect(card).not.toHaveClass('cursor-pointer');
  });

  it('accepts custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Card ref={ref}>Content</Card>);
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
  });

  it('passes through additional HTML div attributes', () => {
    render(<Card data-testid="test-card" role="region">Content</Card>);
    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('role', 'region');
  });

  it('renders nested elements correctly', () => {
    render(
      <Card>
        <h2>Title</h2>
        <p>Description</p>
      </Card>
    );
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });

  it('applies transition styles', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('transition-shadow', 'duration-300');
  });
});
