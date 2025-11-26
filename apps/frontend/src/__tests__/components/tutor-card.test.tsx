import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TutorCard } from '@/components/tutor/tutor-card';
import { TutorProfile } from '@/types/tutor.types';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('TutorCard', () => {
  const mockTutor: TutorProfile = {
    id: '1',
    userId: 'user1',
    name: 'John Doe',
    bio: 'Experienced math tutor with 10 years of teaching experience',
    qualifications: ['PhD in Mathematics'],
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
    demoVideos: [],
    rating: 4.8,
    totalReviews: 25,
    distance: 2.5,
  };

  it('renders tutor name and bio', () => {
    render(<TutorCard tutor={mockTutor} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText(/experienced math tutor/i)).toBeInTheDocument();
  });

  it('displays hourly rate', () => {
    render(<TutorCard tutor={mockTutor} />);

    expect(screen.getByText('$50')).toBeInTheDocument();
    expect(screen.getByText('per hour')).toBeInTheDocument();
  });

  it('shows rating and review count', () => {
    render(<TutorCard tutor={mockTutor} />);

    expect(screen.getByText('4.8')).toBeInTheDocument();
    expect(screen.getByText('(25 reviews)')).toBeInTheDocument();
  });

  it('displays subjects', () => {
    render(<TutorCard tutor={mockTutor} />);

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('shows location and distance', () => {
    render(<TutorCard tutor={mockTutor} />);

    expect(screen.getByText('New York, NY')).toBeInTheDocument();
    expect(screen.getByText('2.5 km away')).toBeInTheDocument();
  });

  it('links to tutor profile page', () => {
    render(<TutorCard tutor={mockTutor} />);

    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/tutors/1');
  });

  it('shows "+X more" when tutor has more than 3 subjects', () => {
    const tutorWithManySubjects = {
      ...mockTutor,
      subjects: [
        { name: 'Math', proficiency: 'expert' as const },
        { name: 'Physics', proficiency: 'expert' as const },
        { name: 'Chemistry', proficiency: 'expert' as const },
        { name: 'Biology', proficiency: 'expert' as const },
      ],
    };

    render(<TutorCard tutor={tutorWithManySubjects} />);

    expect(screen.getByText('+1 more')).toBeInTheDocument();
  });
});
