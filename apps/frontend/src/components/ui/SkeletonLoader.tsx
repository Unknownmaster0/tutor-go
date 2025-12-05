import React from 'react';

export interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const baseClasses = 'animate-pulse bg-neutral-200';

  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    card: 'h-48 rounded-lg',
  };

  const variantClass = variantClasses[variant];

  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : undefined),
  };

  return (
    <div
      className={`${baseClasses} ${variantClass} ${className}`}
      style={style}
      role="status"
      aria-label="Loading content"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

// Preset skeleton components for common use cases
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonLoader
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`p-6 bg-white rounded-lg shadow-soft ${className}`}>
      <div className="flex items-center space-x-4 mb-4">
        <SkeletonLoader variant="circular" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="60%" />
          <SkeletonLoader variant="text" width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
    </div>
  );
};

export const SkeletonAvatar: React.FC<{ size?: string; className?: string }> = ({
  size = '40px',
  className = '',
}) => {
  return (
    <SkeletonLoader
      variant="circular"
      width={size}
      height={size}
      className={className}
    />
  );
};
