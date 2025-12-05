import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AvailabilityManager } from '@/components/tutor/availability-manager';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    put: vi.fn(),
  },
}));

const mockProfile: TutorProfile = {
  id: '1',
  userId: 'user1',
  name: 'John Doe',
  bio: 'Experienced tutor',
  qualifications: [],
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
} as any;

describe('AvailabilityManager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders availability manager', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/manage your availability/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/day/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end time/i)).toBeInTheDocument();
  });

  it('shows empty state when no availability slots exist', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/no availability slots set yet/i)).toBeInTheDocument();
  });

  it('adds a new availability slot', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const daySelect = screen.getByLabelText(/day/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(daySelect, { target: { value: '1' } });
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    expect(screen.getByRole('heading', { level: 4, name: /monday/i })).toBeInTheDocument();
    expect(screen.getByText(/9:00 AM - 10:00 AM/i)).toBeInTheDocument();
  });

  it('prevents adding slot with end time before start time', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '09:00' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/end time must be after start time/i)).toBeInTheDocument();
  });

  it('prevents adding overlapping slots', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const daySelect = screen.getByLabelText(/day/i);
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    // Add first slot
    fireEvent.change(daySelect, { target: { value: '1' } });
    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '11:00' } });
    fireEvent.click(addButton);

    // Try to add overlapping slot
    fireEvent.change(startTimeInput, { target: { value: '10:00' } });
    fireEvent.change(endTimeInput, { target: { value: '12:00' } });
    fireEvent.click(addButton);

    expect(screen.getByText(/this time slot overlaps with an existing slot/i)).toBeInTheDocument();
  });

  it('removes an availability slot', () => {
    const mockOnUpdate = vi.fn();
    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    // Add a slot first
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    // Remove the slot
    const removeButton = screen.getByRole('button', { name: /remove/i });
    fireEvent.click(removeButton);

    expect(screen.queryByText(/9:00 AM - 10:00 AM/i)).not.toBeInTheDocument();
  });

  it('saves availability successfully', async () => {
    const mockOnUpdate = vi.fn();
    const mockPut = vi.mocked(apiClient.put).mockResolvedValue({});

    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    // Add a slot
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    // Save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockPut).toHaveBeenCalledWith('/tutors/availability', {
        availability: [{ dayOfWeek: 1, startTime: '09:00', endTime: '10:00' }],
      });
      expect(screen.getByText(/availability updated successfully/i)).toBeInTheDocument();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('displays error when save fails', async () => {
    const mockOnUpdate = vi.fn();
    const mockPut = vi
      .mocked(apiClient.put)
      .mockRejectedValue({ response: { data: { message: 'Save failed' } } });

    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    // Add a slot
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    // Save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/save failed/i)).toBeInTheDocument();
    });
  });

  it('prevents saving with no availability slots', async () => {
    const mockOnUpdate = vi.fn();
    const mockPut = vi.mocked(apiClient.put);

    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/please add at least one availability slot/i)).toBeInTheDocument();
      expect(mockPut).not.toHaveBeenCalled();
    });
  });

  it('disables save button while loading', async () => {
    const mockOnUpdate = vi.fn();
    const mockPut = vi
      .mocked(apiClient.put)
      .mockImplementation(() => new Promise((resolve) => setTimeout(() => resolve({}), 100)));

    render(<AvailabilityManager profile={mockProfile} onUpdate={mockOnUpdate} />);

    // Add a slot
    const startTimeInput = screen.getByLabelText(/start time/i);
    const endTimeInput = screen.getByLabelText(/end time/i);
    const addButton = screen.getByRole('button', { name: /add slot/i });

    fireEvent.change(startTimeInput, { target: { value: '09:00' } });
    fireEvent.change(endTimeInput, { target: { value: '10:00' } });
    fireEvent.click(addButton);

    // Save
    const saveButton = screen.getByRole('button', { name: /save changes/i });
    fireEvent.click(saveButton);

    expect(saveButton).toBeDisabled();
    expect(screen.getByText(/saving/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(saveButton).not.toBeDisabled();
    });
  });
});
