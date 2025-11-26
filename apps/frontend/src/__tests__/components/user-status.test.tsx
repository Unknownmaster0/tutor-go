import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { UserStatus } from '@/components/chat/user-status';

describe('UserStatus', () => {
  it('should display online status', () => {
    render(<UserStatus isOnline={true} />);

    expect(screen.getByText('Online')).toBeInTheDocument();
  });

  it('should display offline status', () => {
    render(<UserStatus isOnline={false} />);

    expect(screen.getByText('Offline')).toBeInTheDocument();
  });

  it('should display green indicator when online', () => {
    const { container } = render(<UserStatus isOnline={true} />);

    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('should display gray indicator when offline', () => {
    const { container } = render(<UserStatus isOnline={false} />);

    const indicator = container.querySelector('.bg-gray-400');
    expect(indicator).toBeInTheDocument();
  });

  it('should display last seen time when offline', () => {
    const lastSeen = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('30 minutes ago')).toBeInTheDocument();
  });

  it('should display "Just now" for very recent last seen', () => {
    const lastSeen = new Date(Date.now() - 30 * 1000); // 30 seconds ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('Just now')).toBeInTheDocument();
  });

  it('should display hours for last seen within a day', () => {
    const lastSeen = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('2 hours ago')).toBeInTheDocument();
  });

  it('should display days for last seen beyond a day', () => {
    const lastSeen = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('3 days ago')).toBeInTheDocument();
  });

  it('should not display text when showText is false', () => {
    render(<UserStatus isOnline={true} showText={false} />);

    expect(screen.queryByText('Online')).not.toBeInTheDocument();
  });

  it('should display indicator even when showText is false', () => {
    const { container } = render(<UserStatus isOnline={true} showText={false} />);

    const indicator = container.querySelector('.bg-green-500');
    expect(indicator).toBeInTheDocument();
  });

  it('should show pulse animation when online', () => {
    const { container } = render(<UserStatus isOnline={true} />);

    const pulseAnimation = container.querySelector('.animate-ping');
    expect(pulseAnimation).toBeInTheDocument();
  });

  it('should not show pulse animation when offline', () => {
    const { container } = render(<UserStatus isOnline={false} />);

    const pulseAnimation = container.querySelector('.animate-ping');
    expect(pulseAnimation).not.toBeInTheDocument();
  });

  it('should handle singular minute correctly', () => {
    const lastSeen = new Date(Date.now() - 1 * 60 * 1000); // 1 minute ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('1 minute ago')).toBeInTheDocument();
  });

  it('should handle singular hour correctly', () => {
    const lastSeen = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('1 hour ago')).toBeInTheDocument();
  });

  it('should handle singular day correctly', () => {
    const lastSeen = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000); // 1 day ago
    render(<UserStatus isOnline={false} lastSeen={lastSeen} />);

    expect(screen.getByText('1 day ago')).toBeInTheDocument();
  });
});
