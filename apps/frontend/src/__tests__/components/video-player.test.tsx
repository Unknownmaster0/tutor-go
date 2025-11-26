import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { VideoPlayer } from '@/components/video/video-player';

describe('VideoPlayer', () => {
  const mockUrl = 'https://example.com/video.mp4';

  it('renders video player with play button', () => {
    render(<VideoPlayer url={mockUrl} />);

    const playButton = screen.getByRole('button');
    expect(playButton).toBeInTheDocument();
  });

  it('displays title when provided', () => {
    render(<VideoPlayer url={mockUrl} title="Demo Video" />);

    expect(screen.getByText('Demo Video')).toBeInTheDocument();
  });

  it('shows play button initially', () => {
    render(<VideoPlayer url={mockUrl} />);

    const playButton = screen.getByRole('button');
    expect(playButton).toBeInTheDocument();
  });

  it('renders video element', () => {
    render(<VideoPlayer url={mockUrl} />);

    const video = document.querySelector('video');
    expect(video).toBeInTheDocument();
    
    // Check for source element instead of video src attribute
    const source = document.querySelector('source');
    expect(source).toHaveAttribute('src', mockUrl);
  });
});
