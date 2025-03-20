"use client";
// Cookie handler to prevent redirection loops from stale cookies

import { useEffect } from 'react';

export default function CookieHandler() {
  useEffect(() => {
    // Function to clear potentially problematic cookies
    const clearProblemCookies = () => {
      // Get all cookies
      const cookies = document.cookie.split(';');
      
      // Look for cookies that might cause redirection issues
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        
        // Check for next-related cookies that might be causing problems
        if (cookie.startsWith('next-') || 
            cookie.startsWith('__next') || 
            cookie.indexOf('redirect') !== -1) {
          
          // Get the cookie name
          const cookieName = cookie.split('=')[0];
          
          // Delete the cookie by setting it to expire
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          console.log(`Cleared potentially problematic cookie: ${cookieName}`);
        }
      }
    };

    // Only run in production mode
    if (process.env.NODE_ENV === 'production') {
      // Try to clear cookies that might cause redirection loops
      clearProblemCookies();
    }
  }, []);

  // This component doesn't render anything visible
  return null;
} 