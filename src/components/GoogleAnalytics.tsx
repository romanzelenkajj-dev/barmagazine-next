'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { getConsentStatus } from './CookieConsent';

const GA_ID = 'G-JBGVJDXD9E';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

export function GoogleAnalytics() {
  useEffect(() => {
    // On mount, check if user previously accepted and upgrade consent
    const status = getConsentStatus();
    if (status === 'accepted' && typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
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

  // Always render GA — consent mode handles cookie compliance
  return (
    <>
      <Script id="ga-consent-default" strategy="beforeInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
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
    </>
  );
}
