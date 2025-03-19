'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Create a component that uses useSearchParams
const ResultsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resultId = searchParams.get('id');

  useEffect(() => {
    if (resultId) {
      // Redirect to the dynamic route
      router.replace(`/results/${resultId}`);
    } else {
      // If no ID is provided, redirect to home
      router.replace('/');
    }
  }, [resultId, router]);

  // Return loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
};

// Main page component with Suspense boundary
const ResultsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
};

export default ResultsPage; 