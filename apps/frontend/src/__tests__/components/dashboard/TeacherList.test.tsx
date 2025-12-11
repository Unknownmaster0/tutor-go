import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TeacherList } from '@/components/dashboard/TeacherList';
import { Teacher } from '@/types/dashboard.types';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe('TeacherList', () => {
  const mockTeachers: Teacher[] = [
    {
      id: 'teacher-1',
      userId: 'user-1',
      name: 'John Doe',
      email: 'john@example.com',
      subjects: ['Mathematics', 'Physics'],
      hourlyRate: 50,
      rating: 4.5,
      totalReviews: 12,
    },
    {
      id: 'teacher-2',
      userId: 'user-2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      subjects: ['Chemistry', 'Biology'],
      hourlyRate: 45,
      rating: 4.8,
      totalReviews: 20,
    },
    {
      id: 'teacher-3',
      userId: 'user-3',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      subjects: ['English', 'History'],
      hourlyRate: 40,
      rating: 4.2,
      totalReviews: 8,
    },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders all teachers when no filter is applied', () => {
    render(<TeacherList teachers={mockTeachers} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    expect(searchInput).toBeInTheDocument();
  });

  it('filters teachers by name with debouncing', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    // Before debounce, all teachers should still be visible
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Advance timers by 300ms (debounce delay)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // After debounce, only Jane should be visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('filters teachers by subject with debouncing', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'Chemistry' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
  });

  it('is case-insensitive when filtering', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'MATHEMATICS' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('shows "no results" message when filter returns empty', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('No teachers found')).toBeInTheDocument();
    expect(
      screen.getByText("Try adjusting your search to find what you're looking for."),
    ).toBeInTheDocument();
  });

  it('shows clear button when search has value', () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'test' } });

    const clearButton = screen.getByLabelText('Clear search');
    expect(clearButton).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText(
      'Search by name or subject...',
    ) as HTMLInputElement;
    fireEvent.change(searchInput, { target: { value: 'Jane' } });

    expect(searchInput.value).toBe('Jane');

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('renders loading skeletons when isLoading is true', () => {
    render(<TeacherList teachers={[]} isLoading={true} />);

    // Should render skeleton loaders instead of content
    const skeletons = screen.getAllByRole('status');
    expect(skeletons.length).toBeGreaterThan(0);

    // Should not render teacher cards
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  });

  it('calls onTeacherClick when teacher card is clicked', () => {
    const mockOnClick = vi.fn();
    render(<TeacherList teachers={mockTeachers} onTeacherClick={mockOnClick} />);

    const teacherCard = screen.getByText('John Doe').closest('.bg-white');
    fireEvent.click(teacherCard!);

    expect(mockOnClick).toHaveBeenCalledWith('teacher-1');
  });

  it('handles partial name matches', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'Joh' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
  });

  it('handles subjects in object format', async () => {
    const teachersWithObjectSubjects: Teacher[] = [
      {
        id: 'teacher-1',
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        subjects: [
          { name: 'Mathematics', proficiency: 'expert' },
          { name: 'Physics', proficiency: 'advanced' },
        ],
        hourlyRate: 50,
        rating: 4.5,
        totalReviews: 12,
      },
    ];

    render(<TeacherList teachers={teachersWithObjectSubjects} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');
    fireEvent.change(searchInput, { target: { value: 'Mathematics' } });

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays grid layout with responsive classes', () => {
    const { container } = render(<TeacherList teachers={mockTeachers} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('shows appropriate message when no teachers are available', () => {
    render(<TeacherList teachers={[]} />);

    expect(screen.getByText('No teachers found')).toBeInTheDocument();
    expect(screen.getByText('No teachers are currently available.')).toBeInTheDocument();
  });

  it('debounces multiple rapid search inputs', async () => {
    render(<TeacherList teachers={mockTeachers} />);

    const searchInput = screen.getByPlaceholderText('Search by name or subject...');

    // Rapid fire multiple changes
    await act(async () => {
      fireEvent.change(searchInput, { target: { value: 'J' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(searchInput, { target: { value: 'Ja' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(searchInput, { target: { value: 'Jan' } });
      vi.advanceTimersByTime(100);
      fireEvent.change(searchInput, { target: { value: 'Jane' } });
    });

    // All teachers should still be visible before debounce completes
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();

    // Complete the debounce
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now only Jane should be visible
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });
});
