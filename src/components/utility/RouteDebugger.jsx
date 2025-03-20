"use client";
// Route debugger component to help diagnose routing issues

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function RouteDebugger() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only run in development mode or if debugging is enabled
    if (process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_DEBUG_ROUTES === 'true') {
      console.log('Current pathname:', pathname);
      console.log('Base path:', process.env.NEXT_PUBLIC_BASE_PATH || '');
      console.log('NODE_ENV:', process.env.NODE_ENV);
      
      // Log referrer if available
      if (document.referrer) {
        console.log('Referrer:', document.referrer);
      }
      
      // Log any redirection info in localStorage
      try {
        const redirectCount = localStorage.getItem('redirectCount') || 0;
        console.log('Redirect count:', redirectCount);
        
        // Increment and store redirect count to detect loops
        localStorage.setItem('redirectCount', Number(redirectCount) + 1);
        
        // Reset if we've reached a high number (potential loop)
        if (Number(redirectCount) > 5) {
          console.warn('Potential redirect loop detected!');
          localStorage.setItem('redirectCount', 0);
        }
      } catch (e) {
        // localStorage might not be available
        console.error('Could not access localStorage:', e);
      }
    }
  }, [pathname]);

  // This component doesn't render anything visible
  return null;
} 