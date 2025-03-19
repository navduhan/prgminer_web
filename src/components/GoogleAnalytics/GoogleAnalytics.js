'use client';

import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function GoogleAnalytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!GA_MEASUREMENT_ID?.length) return;

    const url = pathname + searchParams.toString();
    
    // Send pageview with a custom path
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  if (!GA_MEASUREMENT_ID?.length) return null;

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
} 