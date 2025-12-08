import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QualificationManager } from '@/components/tutor/qualification-manager';
import { TutorProfile } from '@/types/tutor.types';
import { vi } from 'vitest';

const mockProfile: TutorProfile = {
  id: '1',
  userId: 'user1',
  name: 'John Doe',
  bio: 'Experienced tutor',
  qualifications: ['BSc Mathematics', 'MSc Physics', 'TEFL Certified'],
  subjects: [],
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

describe('QualificationManager', () => {
  it('renders qualification manager with existing qualifications', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByRole('heading', { level: 3, name: /your qualifications/i })).toBeInTheDocument();
    expect(screen.getByText('BSc Mathematics')).toBeInTheDocument();
    expect(screen.getByText('MSc Physics')).toBeInTheDocument();
    expect(screen.getByText('TEFL Certified')).toBeInTheDocument();
  });

  it('adds a new qualification', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const input = screen.getByPlaceholderText(/e\.g\., bachelor's/i);
    const addButton = screen.getByRole('button', { name: /^add$/i });

    fireEvent.change(input, { target: { value: 'PhD in Education' } });
    fireEvent.click(addButton);

    expect(screen.getByText('PhD in Education')).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('adds qualification on Enter key press', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const input = screen.getByPlaceholderText(/e\.g\., bachelor's/i);

    fireEvent.change(input, { target: { value: 'Teaching License' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });

    expect(screen.getByText('Teaching License')).toBeInTheDocument();
  });

  it('prevents adding duplicate qualifications', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const input = screen.getByPlaceholderText(/e\.g\., bachelor's/i);
    const addButton = screen.getByRole('button', { name: /^add$/i });

    fireEvent.change(input, { target: { value: 'BSc Mathematics' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/this qualification is already added/i)).toBeInTheDocument();
  });

  it('prevents adding empty qualification', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const addButton = screen.getByRole('button', { name: /^add$/i });
    fireEvent.click(addButton);

    expect(screen.getByText(/please enter a qualification/i)).toBeInTheDocument();
  });

  it('removes a qualification', () => {
    const mockOnUpdate = vi.fn();
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const removeButtons = screen.getAllByRole('button', { name: /remove/i });
    fireEvent.click(removeButtons[0]);

    expect(screen.queryByText('BSc Mathematics')).not.toBeInTheDocument();
    expect(screen.getByText('MSc Physics')).toBeInTheDocument();
  });

  it('saves qualifications successfully', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({ success: true });
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        qualifications: mockProfile.qualifications,
      });
      expect(screen.getByText(/qualifications updated successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error when save fails', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({
      success: false,
      error: 'Update failed',
    });
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('prevents saving with no qualifications', async () => {
    const mockOnUpdate = vi.fn();
    const profileWithoutQualifications = { ...mockProfile, qualifications: [] };
    render(<QualificationManager profile={profileWithoutQualifications} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/please add at least one qualification/i)).toBeInTheDocument();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });

  it('shows empty state when no qualifications exist', () => {
    const mockOnUpdate = vi.fn();
    const profileWithoutQualifications = { ...mockProfile, qualifications: [] };
    render(<QualificationManager profile={profileWithoutQualifications} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/no qualifications added yet/i)).toBeInTheDocument();
  });

  it('disables save button while loading', async () => {
    const mockOnUpdate = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );
    render(<QualificationManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
});
