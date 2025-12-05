import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BookingForm from '@/components/booking/booking-form';
import { TutorProfile } from '@/types/tutor.types';

const mockTutor: TutorProfile = {
  id: 'tutor-1',
  userId: 'user-1',
  name: 'John Doe',
  bio: 'Experienced math tutor',
  qualifications: ['PhD in Mathematics'],
  subjects: [
    { name: 'Mathematics', proficiency: 'expert' },
    { name: 'Physics', proficiency: 'intermediate' },
  ],
  hourlyRate: 50,
  location: {
    type: 'Point',
    coordinates: [-73.935242, 40.73061],
    address: 'New York, NY',
  },
  demoVideos: [],
  rating: 4.5,
  totalReviews: 10,
};

describe('BookingForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders booking form with tutor information', () => {
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    expect(screen.getByText('Book a Session')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('$50/hour')).toBeInTheDocument();
  });

  it('displays subject options from tutor profile', () => {
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const subjectSelect = screen.getByLabelText('Select Subject');
    expect(subjectSelect).toBeInTheDocument();

    fireEvent.click(subjectSelect);
    expect(screen.getByText('Mathematics (expert)')).toBeInTheDocument();
    expect(screen.getByText('Physics (intermediate)')).toBeInTheDocument();
  });

  it('allows selecting a subject', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    expect(subjectSelect).toHaveValue('Mathematics');
  });

  it('allows selecting a date', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    await user.type(dateInput, dateString);

    expect(dateInput).toHaveValue(dateString);
  });

  it('displays time slots after selecting a date', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];

    await user.type(dateInput, dateString);

    await waitFor(() => {
      expect(screen.getByText('Select Time Slot')).toBeInTheDocument();
    });
  });

  it('displays booking summary when time slot is selected', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Select subject
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    // Select date
    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);

    // Wait for time slots to appear and click first available slot
    await waitFor(() => {
      const timeSlots = screen.getAllByRole('button', { name: /AM|PM/ });
      const availableSlot = timeSlots.find(
        (slot) => !slot.textContent?.includes('Unavailable')
      );
      if (availableSlot) {
        fireEvent.click(availableSlot);
      }
    });

    // Check if booking summary appears
    await waitFor(() => {
      expect(screen.getByText('Booking Summary')).toBeInTheDocument();
    });
  });

  it('calculates total amount correctly', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Select subject
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    // Select date
    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);

    // Wait for time slots and select one
    await waitFor(() => {
      const timeSlots = screen.getAllByRole('button', { name: /AM|PM/ });
      const availableSlot = timeSlots.find(
        (slot) => !slot.textContent?.includes('Unavailable')
      );
      if (availableSlot) {
        fireEvent.click(availableSlot);
      }
    });

    // Check total amount (1 hour * $50)
    await waitFor(() => {
      expect(screen.getByText('$50.00')).toBeInTheDocument();
    });
  });

  it('shows error when submitting without subject', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a subject')).toBeInTheDocument();
    });
  });

  it('shows error when submitting without time slot', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Select subject only
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a time slot')).toBeInTheDocument();
    });
  });

  it('calls onSubmit with correct data when form is valid', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockResolvedValue(undefined);

    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Select subject
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    // Select date
    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);

    // Select time slot
    await waitFor(() => {
      const timeSlots = screen.getAllByRole('button', { name: /AM|PM/ });
      const availableSlot = timeSlots.find(
        (slot) => !slot.textContent?.includes('Unavailable')
      );
      if (availableSlot) {
        fireEvent.click(availableSlot);
      }
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tutorId: 'tutor-1',
          subject: 'Mathematics',
          startTime: expect.any(Date),
          endTime: expect.any(Date),
        })
      );
    });
  });

  it('displays error message when submission fails', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockRejectedValue(new Error('Booking failed'));

    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Fill form
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);

    await waitFor(() => {
      const timeSlots = screen.getAllByRole('button', { name: /AM|PM/ });
      const availableSlot = timeSlots.find(
        (slot) => !slot.textContent?.includes('Unavailable')
      );
      if (availableSlot) {
        fireEvent.click(availableSlot);
      }
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Booking failed')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows error when clicking submit with incomplete form', async () => {
    const user = userEvent.setup();
    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a subject')).toBeInTheDocument();
    });
  });

  it('disables submit button while loading', async () => {
    const user = userEvent.setup();
    mockOnSubmit.mockImplementation(() => new Promise(() => {})); // Never resolves

    render(<BookingForm tutor={mockTutor} onSubmit={mockOnSubmit} />);

    // Fill form
    const subjectSelect = screen.getByLabelText('Select Subject');
    await user.selectOptions(subjectSelect, 'Mathematics');

    const dateInput = screen.getByLabelText('Select Date');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    await user.type(dateInput, dateString);

    await waitFor(() => {
      const timeSlots = screen.getAllByRole('button', { name: /AM|PM/ });
      const availableSlot = timeSlots.find(
        (slot) => !slot.textContent?.includes('Unavailable')
      );
      if (availableSlot) {
        fireEvent.click(availableSlot);
      }
    });

    // Submit form
    const submitButton = screen.getByRole('button', { name: /Proceed to Payment/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });
});
