'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { getConsentStatus } from './CookieConsent';

const GA_ID = 'G-JBGVJDXD9E';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

/** Tracks client-side route changes so GA4 records every page navigation */
function RouteChangeTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window.gtag !== 'function') return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
    window.gtag('config', GA_ID, {
      page_path: url,
    });
  }, [pathname, searchParams]);

  return null;
}

export function GoogleAnalytics() {
  useEffect(() => {
    // On mount, if user previously rejected, downgrade to cookieless
    const status = getConsentStatus();
    if (status === 'rejected' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
      });
    }

    // Listen for future consent changes from the cookie banner
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', {
          analytics_storage: detail === 'accepted' ? 'granted' : 'denied',
        });
      }
    };
    window.addEventListener('cookie-consent-change', handler);
    return () => window.removeEventListener('cookie-consent-change', handler);
  }, []);

  return (
    <>
      {/* 
        Consent Mode v2: default to granted so all visits are tracked.
        If the user rejects cookies, we downgrade to cookieless pings
        (GA still records the session but without personal identifiers).
      */}
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'granted',
          });
        `}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <Suspense fallback={null}>
        <RouteChangeTracker />
      </Suspense>
    </>
  );
}
