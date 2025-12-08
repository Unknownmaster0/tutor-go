import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProfileEditForm } from '@/components/tutor/profile-edit-form';
import { TutorProfile } from '@/types/tutor.types';
import { vi } from 'vitest';

const mockProfile: TutorProfile = {
  id: '1',
  userId: 'user1',
  name: 'John Doe',
  bio: 'Experienced math tutor',
  qualifications: ['BSc Mathematics'],
  subjects: [{ name: 'Mathematics', proficiency: 'expert' }],
  hourlyRate: 50,
  location: {
    type: 'Point',
    coordinates: [-73.935242, 40.73061],
    address: '123 Main St, New York, NY',
  },
  demoVideos: [],
  rating: 4.5,
  totalReviews: 10,
};

describe('ProfileEditForm', () => {
  it('renders profile edit form with existing data', () => {
    const mockOnUpdate = vi.fn();
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByLabelText(/bio/i)).toHaveValue('Experienced math tutor');
    expect(screen.getByLabelText(/hourly rate/i)).toHaveValue(50);
    expect(screen.getByLabelText(/location/i)).toHaveValue('123 Main St, New York, NY');
  });

  it('updates form fields when user types', () => {
    const mockOnUpdate = vi.fn();
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    const bioInput = screen.getByLabelText(/bio/i);
    fireEvent.change(bioInput, { target: { value: 'Updated bio' } });

    expect(bioInput).toHaveValue('Updated bio');
  });

  it('calls onUpdate with correct data when form is submitted', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({ success: true });
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    const bioInput = screen.getByLabelText(/bio/i);
    const rateInput = screen.getByLabelText(/hourly rate/i);
    const submitButton = screen.getByRole('button', { name: /save changes/i });

    fireEvent.change(bioInput, { target: { value: 'New bio' } });
    fireEvent.change(rateInput, { target: { value: '60' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnUpdate).toHaveBeenCalledWith({
        bio: 'New bio',
        hourlyRate: 60,
        location: expect.objectContaining({
          address: '123 Main St, New York, NY',
        }),
      });
    });
  });

  it('displays success message after successful update', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({ success: true });
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    });
  });

  it('displays error message when update fails', async () => {
    const mockOnUpdate = vi.fn().mockResolvedValue({
      success: false,
      error: 'Update failed',
    });
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/update failed/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    const mockOnUpdate = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
    );
    render(<ProfileEditForm profile={mockProfile} onUpdate={mockOnUpdate} />);

    const submitButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });
});
