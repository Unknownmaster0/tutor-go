import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Home from '@/app/page';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock the SearchBar component
vi.mock('@/components/search/search-bar', () => ({
  SearchBar: ({ onSearch }: any) => (
    <div data-testid="search-bar">
      <button onClick={() => onSearch('Test Location')}>Search</button>
    </div>
  ),
}));

describe('Landing Page', () => {
  it('renders hero section with title', () => {
    render(<Home />);

    expect(screen.getByText(/find your perfect tutor nearby/i)).toBeInTheDocument();
    expect(screen.getByText(/connect with qualified tutors/i)).toBeInTheDocument();
  });

  it('renders search bar component', () => {
    render(<Home />);

    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders features section', () => {
    render(<Home />);

    expect(screen.getByText(/why choose tutorgo/i)).toBeInTheDocument();
    expect(screen.getByText(/location-based search/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /demo videos/i })).toBeInTheDocument();
    expect(screen.getByText(/secure payments/i)).toBeInTheDocument();
  });

  it('renders how it works section', () => {
    render(<Home />);

    expect(screen.getByText(/how it works/i)).toBeInTheDocument();
    expect(screen.getByText(/search for tutors/i)).toBeInTheDocument();
    expect(screen.getByText(/review profiles/i)).toBeInTheDocument();
    expect(screen.getByText(/book & learn/i)).toBeInTheDocument();
  });

  it('renders CTA section with sign up links', () => {
    render(<Home />);

    expect(screen.getByText(/ready to start learning/i)).toBeInTheDocument();
    expect(screen.getByText(/sign up as student/i)).toBeInTheDocument();
    expect(screen.getByText(/become a tutor/i)).toBeInTheDocument();
  });
});
