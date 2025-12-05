import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SubjectManager } from '@/components/tutor/subject-manager';
import { TutorProfile } from '@/types/tutor.types';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

const mockProfile: TutorProfile = {
  id: '1',
  userId: 'user1',
  name: 'John Doe',
  bio: 'Experienced tutor',
  qualifications: [],
  subjects: [
    { name: 'Mathematics', proficiency: 'expert' },
    { name: 'Physics', proficiency: 'intermediate' },
  ],
  hourlyRate: 50,
  location: {
    type: 'Point',
    coordinates: [-73.935242, 40.73061],
    address: '123 Main St',
  },
  demoVideos: [],
  rating: 4.5,
  totalReviews: 10,
};

describe('SubjectManager', () => {
  it('renders subject manager with existing subjects', () => {
    const mockOnUpdate = vi.fn();
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByRole('heading', { name: /subjects you teach/i })).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('adds a new subject', () => {
    const mockOnUpdate = vi.fn();
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText(/subject name/i);
    const proficiencySelect = screen.getByLabelText(/proficiency/i);
    const addButton = screen.getByRole('button', { name: /add subject/i });

    fireEvent.change(nameInput, { target: { value: 'Chemistry' } });
    fireEvent.change(proficiencySelect, { target: { value: 'expert' } });
    fireEvent.click(addButton);

    expect(screen.getByText('Chemistry')).toBeInTheDocument();
    expect(nameInput).toHaveValue('');
  });

  it('prevents adding duplicate subjects', () => {
    const mockOnUpdate = vi.fn();
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const nameInput = screen.getByLabelText(/subject name/i);
    const addButton = screen.getByRole('button', { name: /add subject/i });

    fireEvent.change(nameInput, { target: { value: 'Mathematics' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/this subject is already added/i)).toBeInTheDocument();
  });

  it('prevents adding empty subject name', () => {
    const mockOnUpdate = vi.fn();
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /add subject/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/please enter a subject name/i)).toBeInTheDocument();
  });

  it('removes a subject', () => {
    const mockOnUpdate = vi.fn();
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('Mathematics')).not.toBeInTheDocument();
    expect(screen.getByText('Physics')).toBeInTheDocument();
  });

  it('saves subjects successfully', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({ success: true });
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        subjects: mockProfile.subjects,
      });
      expect(screen.getByText(/subjects updated successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error when save fails', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({
      success: false,
      error: 'Save failed',
    });
    render(<SubjectManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
  });

  it('prevents saving with no subjects', async () => {
    const mockOnUpdate = vi.fn();
    const profileWithoutSubjects = { ...mockProfile, subjects: [] };
    render(<SubjectManager profile={profileWithoutSubjects} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/please add at least one subject/i)).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('shows empty state when no subjects exist', () => {
    const mockOnUpdate = vi.fn();
    const profileWithoutSubjects = { ...mockProfile, subjects: [] };
    render(<SubjectManager profile={profileWithoutSubjects} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/no subjects added yet/i)).toBeInTheDocument();
  });
});
