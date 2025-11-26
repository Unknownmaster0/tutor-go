import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModerationFilters } from '@/components/admin/moderation-filters';

describe('ModerationFilters', () => {
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders moderation filters', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByTestId('moderation-filters')).toBeInTheDocument();
    expect(screen.getByTestId('type-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
  });

  it('calls onFilterChange when type filter changes', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    const typeFilter = screen.getByTestId('type-filter');
    fireEvent.change(typeFilter, { target: { value: 'review' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: 'review',
      status: '',
    });
  });

  it('calls onFilterChange when status filter changes', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'pending' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      type: '',
      status: 'pending',
    });
  });

  it('displays all type options', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    const typeFilter = screen.getByTestId('type-filter');
    expect(typeFilter).toHaveTextContent('All Types');
    expect(typeFilter).toHaveTextContent('Reviews');
    expect(typeFilter).toHaveTextContent('Messages');
  });

  it('displays all status options', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    const statusFilter = screen.getByTestId('status-filter');
    expect(statusFilter).toHaveTextContent('All Statuses');
    expect(statusFilter).toHaveTextContent('Pending');
    expect(statusFilter).toHaveTextContent('Approved');
    expect(statusFilter).toHaveTextContent('Removed');
  });

  it('updates multiple filters independently', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    const typeFilter = screen.getByTestId('type-filter');
    const statusFilter = screen.getByTestId('status-filter');

    fireEvent.change(typeFilter, { target: { value: 'message' } });
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      type: 'message',
      status: '',
    });

    fireEvent.change(statusFilter, { target: { value: 'approved' } });
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      type: 'message',
      status: 'approved',
    });
  });

  it('has correct labels', () => {
    render(<ModerationFilters onFilterChange={mockOnFilterChange} />);

    expect(screen.getByText('Content Type')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });
});
