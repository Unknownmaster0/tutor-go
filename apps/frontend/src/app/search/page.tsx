'use client';

import { Suspense } from 'react';
import SearchPageContent from './search-content';

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <SearchPageContent />
    </Suspense>
  );
}
