import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoUpload } from '@/components/tutor/video-upload';
import { TutorProfile } from '@/types/tutor.types';
import { apiClient } from '@/lib/api-client';
import axios from 'axios';
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
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';
import { vi } from 'vitest';

vi.mock('@/lib/api-client', () => ({
  apiClient: {
    delete: vi.fn(),
  },
}));
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
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
  demoVideos: ['https://example.com/video1.mp4'],
  rating: 4.5,
  totalReviews: 10,
};

describe('VideoUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Storage.prototype.getItem = vi.fn(() => 'mock-token');
  });

  it('renders video upload component', () => {
    const mockOnUpdate = vi.fn();
    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByRole('heading', { level: 3, name: /demo videos/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/select video file/i)).toBeInTheDocument();
  });

  it('displays existing videos', () => {
    const mockOnUpdate = vi.fn();
    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/your videos/i)).toBeInTheDocument();
    const videos = screen.getAllByRole('button', { name: /delete video/i });
    expect(videos).toHaveLength(1);
  });

  it('shows message when no videos exist', () => {
    const mockOnUpdate = vi.fn();
    const profileWithoutVideos = { ...mockProfile, demoVideos: [] };
    render(<VideoUpload profile={profileWithoutVideos} onUpdate={mockOnUpdate} />);

    expect(screen.getByText(/no demo videos uploaded yet/i)).toBeInTheDocument();
  });

  it('validates file type on selection', () => {
    const mockOnUpdate = vi.fn();
    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const fileInput = screen.getByLabelText(/select video file/i);
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' });

    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByText(/please select a valid video file/i)).toBeInTheDocument();
  });

  it('validates file size on selection', () => {
    const mockOnUpdate = vi.fn();
    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const fileInput = screen.getByLabelText(/select video file/i);
    const largeFile = new File(['content'], 'large.mp4', {
      type: 'video/mp4',
    });
    Object.defineProperty(largeFile, 'size', { value: 101 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [largeFile] } });

    expect(screen.getByText(/video file must be less than 100mb/i)).toBeInTheDocument();
  });

  it('displays selected file information', () => {
    const mockOnUpdate = vi.fn();
    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const fileInput = screen.getByLabelText(/select video file/i);
    const validFile = new File(['content'], 'test.mp4', { type: 'video/mp4' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(screen.getByText(/selected: test\.mp4/i)).toBeInTheDocument();
  });

  it('uploads video with progress indicator', async () => {
    const mockOnUpdate = vi.fn();
    const mockAxiosPost = vi.mocked(axios.post).mockResolvedValue({ data: {} });

    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const fileInput = screen.getByLabelText(/select video file/i);
    const validFile = new File(['content'], 'test.mp4', { type: 'video/mp4' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload video/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(mockAxiosPost).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByText(/video uploaded successfully/i)).toBeInTheDocument();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('handles upload error', async () => {
    const mockOnUpdate = vi.fn();
    const mockAxiosPost = vi
      .mocked(axios.post)
      .mockRejectedValue({ response: { data: { message: 'Upload failed' } } });

    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const fileInput = screen.getByLabelText(/select video file/i);
    const validFile = new File(['content'], 'test.mp4', { type: 'video/mp4' });

    fireEvent.change(fileInput, { target: { files: [validFile] } });

    const uploadButton = screen.getByRole('button', { name: /upload video/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(screen.getByText(/upload failed/i)).toBeInTheDocument();
    });
  });

  it('deletes video after confirmation', async () => {
    const mockOnUpdate = vi.fn();
    const mockDelete = vi.mocked(apiClient.delete).mockResolvedValue({});
    window.confirm = vi.fn(() => true);

    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByRole('button', { name: /delete video/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalled();
      expect(mockOnUpdate).toHaveBeenCalled();
    });
  });

  it('cancels delete when user declines confirmation', async () => {
    const mockOnUpdate = vi.fn();
    const mockDelete = vi.mocked(apiClient.delete);
    window.confirm = vi.fn(() => false);

    render(<VideoUpload profile={mockProfile} onUpdate={mockOnUpdate} />);

    const deleteButton = screen.getByRole('button', { name: /delete video/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockDelete).not.toHaveBeenCalled();
    });
  });
});
