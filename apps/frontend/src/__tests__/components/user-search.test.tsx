import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UserSearch } from '@/components/admin/user-search';
import { vi } from 'vitest';

describe('UserSearch', () => {
  const mockOnSearch = vi.fn();
  const mockOnFilterChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search input and filters', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByTestId('user-search')).toBeInTheDocument();
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
    expect(screen.getByTestId('role-filter')).toBeInTheDocument();
    expect(screen.getByTestId('status-filter')).toBeInTheDocument();
  });

  it('calls onSearch when search input changes', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'john' } });

    expect(mockOnSearch).toHaveBeenCalledWith('john');
  });

  it('calls onFilterChange when role filter changes', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const roleFilter = screen.getByTestId('role-filter');
    fireEvent.change(roleFilter, { target: { value: 'student' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      role: 'student',
      status: '',
    });
  });

  it('calls onFilterChange when status filter changes', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const statusFilter = screen.getByTestId('status-filter');
    fireEvent.change(statusFilter, { target: { value: 'active' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({
      role: '',
      status: 'active',
    });
  });

  it('displays all role options', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const roleFilter = screen.getByTestId('role-filter');
    expect(roleFilter).toHaveTextContent('All Roles');
    expect(roleFilter).toHaveTextContent('Student');
    expect(roleFilter).toHaveTextContent('Tutor');
    expect(roleFilter).toHaveTextContent('Admin');
  });

  it('displays all status options', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const statusFilter = screen.getByTestId('status-filter');
    expect(statusFilter).toHaveTextContent('All Statuses');
    expect(statusFilter).toHaveTextContent('Active');
    expect(statusFilter).toHaveTextContent('Suspended');
    expect(statusFilter).toHaveTextContent('Unverified');
  });

  it('updates multiple filters independently', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const roleFilter = screen.getByTestId('role-filter');
    const statusFilter = screen.getByTestId('status-filter');

    fireEvent.change(roleFilter, { target: { value: 'tutor' } });
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      role: 'tutor',
      status: '',
    });

    fireEvent.change(statusFilter, { target: { value: 'suspended' } });
    expect(mockOnFilterChange).toHaveBeenLastCalledWith({
      role: 'tutor',
      status: 'suspended',
    });
  });

  it('has correct placeholder text', () => {
    render(<UserSearch onSearch={mockOnSearch} onFilterChange={mockOnFilterChange} />);

    const searchInput = screen.getByTestId('search-input');
    expect(searchInput).toHaveAttribute('placeholder', 'Search by name or email...');
  });
});
