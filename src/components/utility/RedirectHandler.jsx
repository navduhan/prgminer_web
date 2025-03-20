"use client";
// Client-side redirect handler

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

// Get base path from environment variable
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

/**
 * RedirectHandler component for client-side redirects
 * This ensures users are properly redirected to the correct paths with basePath
 */
export default function RedirectHandler() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Handle production mode redirects
    if (process.env.NODE_ENV === 'production') {
      // If we're at the root, redirect to basePath
      if (pathname === '/') {
        router.replace(`${basePath}/`);
      }
      
      // If the path doesn't include basePath but should, redirect
      if (pathname !== '/' && !pathname.startsWith(basePath) && !pathname.startsWith('/_next')) {
        const newPath = `${basePath}${pathname}`;
        router.replace(newPath);
      }
    }
  }, [pathname, router]);

  // This component doesn't render anything visible
  return null;
} 