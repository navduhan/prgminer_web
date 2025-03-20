"use client";
// Client-side redirect handler

import { useEffect, useRef } from 'react';
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
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Only run in production and only once per session
    if (process.env.NODE_ENV === 'production' && !hasRedirected.current) {
      // If we're at the root, redirect to basePath
      if (pathname === '/' && basePath) {
        hasRedirected.current = true;
        router.replace(`${basePath}/`);
        return;
      }
      
      // If the path doesn't include basePath but should
      if (pathname && pathname !== '/' && !pathname.startsWith(basePath) && !pathname.startsWith('/_next')) {
        hasRedirected.current = true;
        const newPath = `${basePath}${pathname}`;
        router.replace(newPath);
      }
    }
  }, [pathname, router]);

  // This component doesn't render anything visible
  return null;
} 