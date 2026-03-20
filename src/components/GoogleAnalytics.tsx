'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { getConsentStatus, type ConsentStatus } from './CookieConsent';

const GA_ID = 'G-JBGVJDXD9E';

export function GoogleAnalytics() {
  const [consent, setConsent] = useState<ConsentStatus>(null);

  useEffect(() => {
    // Check initial consent status
    setConsent(getConsentStatus());

    // Listen for consent changes
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as ConsentStatus;
      setConsent(detail);
    };
    window.addEventListener('cookie-consent-change', handler);
    return () => window.removeEventListener('cookie-consent-change', handler);
  }, []);

  // Only render GA scripts when consent is explicitly accepted
  if (consent !== 'accepted') return null;

  return (
    <>
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
