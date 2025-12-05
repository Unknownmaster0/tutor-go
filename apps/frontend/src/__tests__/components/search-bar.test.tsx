import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchBar } from '@/components/search/search-bar';

// Mock the geolocation hook
vi.mock('@/hooks/use-geolocation', () => ({
  useGeolocation: () => ({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
    getCurrentLocation: vi.fn(),
  }),
}));

describe('SearchBar', () => {
  const mockOnSearch = vi.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders search input and buttons', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    expect(screen.getByPlaceholderText(/enter location/i)).toBeInTheDocument();
    expect(screen.getByText(/use my location/i)).toBeInTheDocument();
    expect(screen.getByText(/search tutors/i)).toBeInTheDocument();
  });

  it('calls onSearch when form is submitted with location', async () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/enter location/i);
    const submitButton = screen.getByText(/search tutors/i);

    fireEvent.change(input, { target: { value: 'New York' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('New York', undefined, undefined);
    });
  });

  it('does not call onSearch when location is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const submitButton = screen.getByText(/search tutors/i);
    fireEvent.click(submitButton);

    expect(mockOnSearch).not.toHaveBeenCalled();
  });

  it('disables submit button when location is empty', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const submitButton = screen.getByText(/search tutors/i) as HTMLButtonElement;
    expect(submitButton.disabled).toBe(true);
  });

  it('enables submit button when location is entered', () => {
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText(/enter location/i);
    const submitButton = screen.getByText(/search tutors/i) as HTMLButtonElement;

    fireEvent.change(input, { target: { value: 'Boston' } });

    expect(submitButton.disabled).toBe(false);
  });
});
