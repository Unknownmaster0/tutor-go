import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TeacherCard } from '@/components/dashboard/TeacherCard';
import { Teacher } from '@/types/dashboard.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('TeacherCard', () => {
  const mockTeacher: Teacher = {
    id: 'teacher-1',
    userId: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    subjects: ['Mathematics', 'Physics', 'Chemistry'],
    hourlyRate: 50,
    rating: 4.5,
    totalReviews: 12,
    profilePicture: 'https://example.com/profile.jpg',
  };

  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders teacher information correctly', () => {
    render(<TeacherCard teacher={mockTeacher} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$50/hr')).toBeInTheDocument();
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('(12 reviews)')).toBeInTheDocument();
  });

  it('renders profile picture when provided', () => {
    render(<TeacherCard teacher={mockTeacher} />);

    const img = screen.getByAltText("John Doe's profile");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/profile.jpg');
  });

  it('renders initials when profile picture is not provided', () => {
    const teacherWithoutPicture = { ...mockTeacher, profilePicture: undefined };
    render(<TeacherCard teacher={teacherWithoutPicture} />);

    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('renders subjects as badges', () => {
    render(<TeacherCard teacher={mockTeacher} />);

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('Chemistry')).toBeInTheDocument();
  });

  it('limits displayed subjects to 3 and shows count for remaining', () => {
    const teacherWithManySubjects = {
      ...mockTeacher,
      subjects: ['Math', 'Physics', 'Chemistry', 'Biology', 'English'],
    };
    render(<TeacherCard teacher={teacherWithManySubjects} />);

    expect(screen.getByText('Math')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
    expect(screen.getByText('Chemistry')).toBeInTheDocument();
    expect(screen.getByText('+2 more')).toBeInTheDocument();
    expect(screen.queryByText('Biology')).not.toBeInTheDocument();
  });

  it('handles subjects in object format', () => {
    const teacherWithObjectSubjects = {
      ...mockTeacher,
      subjects: [
        { name: 'Mathematics', proficiency: 'expert' },
        { name: 'Physics', proficiency: 'advanced' },
      ],
    };
    render(<TeacherCard teacher={teacherWithObjectSubjects} />);

    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('navigates to teacher profile on click', () => {
    render(<TeacherCard teacher={mockTeacher} />);

    const card = screen.getByText('John Doe').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockPush).toHaveBeenCalledWith('/tutors/teacher-1');
  });

  it('calls custom onClick handler when provided', () => {
    const mockOnClick = vi.fn();
    render(<TeacherCard teacher={mockTeacher} onClick={mockOnClick} />);

    const card = screen.getByText('John Doe').closest('.bg-white');
    fireEvent.click(card!);

    expect(mockOnClick).toHaveBeenCalledWith('teacher-1');
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('displays singular "review" for 1 review', () => {
    const teacherWithOneReview = { ...mockTeacher, totalReviews: 1 };
    render(<TeacherCard teacher={teacherWithOneReview} />);

    expect(screen.getByText('(1 review)')).toBeInTheDocument();
  });

  it('formats rating to 1 decimal place', () => {
    const teacherWithPreciseRating = { ...mockTeacher, rating: 4.567 };
    render(<TeacherCard teacher={teacherWithPreciseRating} />);

    expect(screen.getByText('4.6')).toBeInTheDocument();
  });

  it('applies hover styles from Card component', () => {
    render(<TeacherCard teacher={mockTeacher} />);

    const card = screen.getByText('John Doe').closest('.bg-white');
    expect(card).toHaveClass('hover:shadow-medium');
    expect(card).toHaveClass('cursor-pointer');
  });
});
