import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TutorProfilePage from '@/app/tutors/[id]/page';
import { apiClient } from '@/lib/api-client';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: '123' }),
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock API client
vi.mock('@/lib/api-client', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock components
vi.mock('@/components/video/video-player', () => ({
  VideoPlayer: ({ title }: any) => <div data-testid="video-player">{title}</div>,
}));

vi.mock('@/components/review/review-card', () => ({
  ReviewCard: ({ review }: any) => <div data-testid="review-card">{review.studentName}</div>,
}));

vi.mock('@/components/calendar/availability-calendar', () => ({
  AvailabilityCalendar: () => <div data-testid="availability-calendar">Calendar</div>,
}));

describe('TutorProfilePage', () => {
  const mockTutor = {
    id: '123',
    userId: 'user1',
    name: 'John Doe',
    bio: 'Experienced math tutor',
    qualifications: ['PhD in Mathematics', 'Teaching Certificate'],
    subjects: [
      { name: 'Mathematics', proficiency: 'expert' },
      { name: 'Physics', proficiency: 'intermediate' },
    ],
    hourlyRate: 50,
    location: {
      type: 'Point',
      coordinates: [-74.006, 40.7128],
      address: 'New York, NY',
    },
    demoVideos: ['https://example.com/video1.mp4'],
    rating: 4.8,
    totalReviews: 25,
  };

  const mockReviews = [
    {
      id: '1',
      studentName: 'Jane Smith',
      rating: 5,
      comment: 'Great tutor!',
      createdAt: '2024-01-15T10:00:00Z',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    (apiClient.get as any).mockImplementation(() => new Promise(() => {}));

    render(<TutorProfilePage />);

    expect(screen.getByText(/loading tutor profile/i)).toBeInTheDocument();
  });

  it('displays tutor profile after loading', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: mockReviews });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    expect(screen.getByText(/experienced math tutor/i)).toBeInTheDocument();
    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('4.8')).toBeInTheDocument();
  });

  it('displays qualifications', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: [] });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('PhD in Mathematics')).toBeInTheDocument();
    });

    expect(screen.getByText('Teaching Certificate')).toBeInTheDocument();
  });

  it('displays subjects taught', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: [] });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('Mathematics')).toBeInTheDocument();
    });

    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('renders demo videos when available', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: [] });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('video-player')).toBeInTheDocument();
    });
  });

  it('displays reviews', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: mockReviews });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    // Click reviews tab
    const reviewsTab = screen.getByText(/reviews \(25\)/i);
    reviewsTab.click();

    await waitFor(() => {
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch failure', async () => {
    (apiClient.get as any).mockRejectedValue({
      response: { data: { message: 'Tutor not found' } },
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/profile not found/i)).toBeInTheDocument();
    });
  });

  it('renders availability calendar', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: [] });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByTestId('availability-calendar')).toBeInTheDocument();
    });
  });

  it('displays book session button', async () => {
    (apiClient.get as any).mockImplementation((url: string) => {
      if (url.includes('/tutors/')) {
        return Promise.resolve(mockTutor);
      }
      if (url.includes('/reviews/')) {
        return Promise.resolve({ reviews: [] });
      }
    });

    render(<TutorProfilePage />);

    await waitFor(() => {
      expect(screen.getByText(/book a session/i)).toBeInTheDocument();
    });
  });
});
