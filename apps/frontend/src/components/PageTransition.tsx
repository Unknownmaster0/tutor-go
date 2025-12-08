'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * PageTransition Component
 * Provides smooth fade-in/fade-out animations when navigating between pages.
 * Uses Next.js App Router's usePathname to detect route changes.
 *
 * Animation Details:
 * - Entry: Fade in + slight upward translation (200ms cubic-bezier)
 * - Exit: Fade out + slight downward translation (200ms cubic-bezier)
 * - Respects prefers-reduced-motion for accessibility
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [currentPath, setCurrentPath] = useState<string | undefined>(pathname);

  // Initial fade-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  // Trigger exit→enter animation on pathname change
  useEffect(() => {
    if (currentPath && pathname !== currentPath) {
      // Start exit animation
      setVisible(false);
      const timeoutId = setTimeout(() => {
        setCurrentPath(pathname);
        // Start enter animation
        requestAnimationFrame(() => setVisible(true));
      }, 200); // Match CSS transition duration
      return () => clearTimeout(timeoutId);
    } else {
      setCurrentPath(pathname);
    }
  }, [pathname, currentPath]);

  return (
    <div
      className={`page-transition ${visible ? 'page-transition--enter' : 'page-transition--exit'}`}
      aria-live="polite"
      aria-label="Page content"
    >
      {children}
    </div>
  );
}
