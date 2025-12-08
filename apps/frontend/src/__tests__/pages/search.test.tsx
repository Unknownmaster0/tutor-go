import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPage from '@/app/search/page';
import { apiClient } from '@/lib/api-client';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: (key: string) => {
      const params: Record<string, string> = {
        lat: '40.7128',
        lng: '-74.0060',
        radius: '10',
      };
      return params[key] || null;
    },
  }),
}));

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock components
vi.mock('@/components/tutor/tutor-card', () => ({
  TutorCard: ({ tutor }: any) => <div data-testid="tutor-card">{tutor.name}</div>,
}));

vi.mock('@/components/search/search-filters', () => ({
  SearchFilters: ({ onFilterChange }: any) => (
    <div data-testid="search-filters">
      <button onClick={() => onFilterChange({ subject: 'Math' })}>Filter</button>
    </div>
  ),
}));

vi.mock('@/components/map/tutor-map', () => ({
  TutorMap: () => <div data-testid="tutor-map">Map</div>,
}));

describe('SearchPage', () => {
  const mockTutors = [
    {
      id: '1',
      userId: 'user1',
      name: 'John Doe',
      bio: 'Math tutor',
      qualifications: [],
      subjects: [{ name: 'Math', proficiency: 'expert' }],
      hourlyRate: 50,
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
        address: 'New York, NY',
      },
      demoVideos: [],
      rating: 4.8,
      totalReviews: 25,
      distance: 2.5,
    },
    {
      id: '2',
      userId: 'user2',
      name: 'Jane Smith',
      bio: 'Physics tutor',
      qualifications: [],
      subjects: [{ name: 'Physics', proficiency: 'expert' }],
      hourlyRate: 60,
      location: {
        type: 'Point',
        coordinates: [-74.006, 40.7128],
        address: 'New York, NY',
      },
      demoVideos: [],
      rating: 4.9,
      totalReviews: 30,
      distance: 3.2,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (apiClient.get as any).mockImplementation(() => new Promise(() => {}));

    render(<SearchPage />);

    expect(screen.getByText(/searching for tutors/i)).toBeInTheDocument();
  });

  it('displays tutors after successful search', async () => {
    (apiClient.get as any).mockResolvedValue({
      tutors: mockTutors,
      total: 2,
      page: 1,
      limit: 10,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Tutors Near You')).toBeInTheDocument();
      expect(screen.getByText('2 tutors found')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('displays error message on search failure', async () => {
    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: 'Search failed' } },
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('Search failed')).toBeInTheDocument();
    });
  });

  it('shows "no tutors found" message when search returns empty', async () => {
    (apiClient.get as any).mockResolvedValue({
      tutors: [],
      total: 0,
      page: 1,
      limit: 10,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText(/no tutors found/i)).toBeInTheDocument();
    });
  });

  it('renders search filters', async () => {
    (apiClient.get as any).mockResolvedValue({
      tutors: mockTutors,
      total: 2,
      page: 1,
      limit: 10,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByTestId('search-filters')).toBeInTheDocument();
    });
  });

  it('displays correct tutor count', async () => {
    (apiClient.get as any).mockResolvedValue({
      tutors: mockTutors,
      total: 2,
      page: 1,
      limit: 10,
    });

    render(<SearchPage />);

    await waitFor(() => {
      expect(screen.getByText('2 tutors found')).toBeInTheDocument();
    });
  });
});
