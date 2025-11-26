import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '@/components/ui/Input';

describe('Input Component', () => {
  it('renders input field', () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('renders with label', () => {
    render(<Input label="Username" />);
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
  });

  it('generates id from label when id is not provided', () => {
    render(<Input label="Email Address" />);
    const input = screen.getByLabelText('Email Address');
    expect(input).toHaveAttribute('id', 'email-address');
  });

  it('uses provided id over generated one', () => {
    render(<Input label="Username" id="custom-id" />);
    const input = screen.getByLabelText('Username');
    expect(input).toHaveAttribute('id', 'custom-id');
  });

  it('applies base styles', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('w-full', 'px-4', 'py-2', 'rounded-md', 'border');
  });

  it('applies default border styles when no state is provided', () => {
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-neutral-300', 'focus:border-primary-500');
  });

  it('displays error message when error prop is provided', () => {
    render(<Input label="Email" error="Invalid email address" />);
    expect(screen.getByText('Invalid email address')).toBeInTheDocument();
  });

  it('applies error styles when error prop is provided', () => {
    render(<Input data-testid="input" error="Error message" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-error', 'focus:border-error', 'focus:ring-error');
  });

  it('sets aria-invalid to true when error is present', () => {
    render(<Input data-testid="input" error="Error message" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('applies success styles when success prop is true', () => {
    render(<Input data-testid="input" success />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('border-success', 'focus:border-success', 'focus:ring-success');
  });

  it('displays success indicator when success is true and no error', () => {
    render(<Input label="Email" success />);
    expect(screen.getByText('✓ Valid')).toBeInTheDocument();
  });

  it('displays helper text when provided', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);
    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('does not display helper text when error is present', () => {
    render(
      <Input
        label="Email"
        helperText="Enter your email"
        error="Invalid email"
      />
    );
    expect(screen.queryByText('Enter your email')).not.toBeInTheDocument();
    expect(screen.getByText('Invalid email')).toBeInTheDocument();
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toBeDisabled();
  });

  it('applies disabled styles when disabled', () => {
    render(<Input disabled data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
  });

  it('accepts user input', async () => {
    const user = userEvent.setup();
    render(<Input data-testid="input" />);
    const input = screen.getByTestId('input') as HTMLInputElement;
    
    await user.type(input, 'Hello World');
    expect(input.value).toBe('Hello World');
  });

  it('calls onChange handler when value changes', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    
    render(<Input onChange={handleChange} data-testid="input" />);
    const input = screen.getByTestId('input');
    
    await user.type(input, 'a');
    expect(handleChange).toHaveBeenCalled();
  });

  it('accepts custom className', () => {
    render(<Input className="custom-class" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = React.createRef<HTMLInputElement>();
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it('passes through additional HTML input attributes', () => {
    render(<Input type="email" placeholder="email@example.com" data-testid="input" />);
    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'email');
    expect(input).toHaveAttribute('placeholder', 'email@example.com');
  });

  it('associates error message with input using aria-describedby', () => {
    render(<Input label="Email" error="Invalid email" />);
    const input = screen.getByLabelText('Email');
    expect(input).toHaveAttribute('aria-describedby', 'email-error');
  });

  it('associates helper text with input using aria-describedby', () => {
    render(<Input label="Password" helperText="Enter password" />);
    const input = screen.getByLabelText('Password');
    expect(input).toHaveAttribute('aria-describedby', 'password-helper');
  });

  it('error message has role alert', () => {
    render(<Input label="Email" error="Invalid email" />);
    const errorMessage = screen.getByText('Invalid email');
    expect(errorMessage).toHaveAttribute('role', 'alert');
  });
});
