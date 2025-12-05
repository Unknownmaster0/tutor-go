import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SearchFilters } from '@/components/search/search-filters';

describe('SearchFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    mockOnFilterChange.mockClear();
  });

  it('renders all filter options', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByText(/distance:/i)).toBeInTheDocument();
    expect(screen.getByText(/hourly rate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/minimum rating/i)).toBeInTheDocument();
  });

  it('calls onFilterChange when subject is selected', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    const subjectSelect = screen.getByRole('combobox', { name: /subject/i });
    fireEvent.change(subjectSelect, { target: { value: 'Mathematics' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ subject: 'Mathematics' })
    );
  });

  it('calls onFilterChange when radius is adjusted', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    const radiusSlider = screen.getByRole('slider');
    fireEvent.change(radiusSlider, { target: { value: '25' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ radius: 25 })
    );
  });

  it('calls onFilterChange when min rate is entered', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    const minRateInput = screen.getByPlaceholderText('Min');
    fireEvent.change(minRateInput, { target: { value: '20' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ minRate: 20 })
    );
  });

  it('calls onFilterChange when max rate is entered', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    const maxRateInput = screen.getByPlaceholderText('Max');
    fireEvent.change(maxRateInput, { target: { value: '100' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ maxRate: 100 })
    );
  });

  it('calls onFilterChange when minimum rating is selected', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    const ratingSelect = screen.getByRole('combobox', { name: /minimum rating/i });
    fireEvent.change(ratingSelect, { target: { value: '4.5' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith(
      expect.objectContaining({ minRating: 4.5 })
    );
  });

  it('resets all filters when reset button is clicked', () => {
    render(<SearchFilters onFilterChange={mockOnFilterChange} />);

    // Change some filters first
    const subjectSelect = screen.getByRole('combobox', { name: /subject/i });
    fireEvent.change(subjectSelect, { target: { value: 'Mathematics' } });

    mockOnFilterChange.mockClear();

    // Click reset
    const resetButton = screen.getByText(/reset filters/i);
    fireEvent.click(resetButton);

    expect(mockOnFilterChange).toHaveBeenCalledWith({ radius: 10 });
  });
});
