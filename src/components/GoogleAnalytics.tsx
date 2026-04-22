'use client';

import { Suspense, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { getConsentStatus } from './CookieConsent';

const GA_ID = 'G-JBGVJDXD9E';
const CANONICAL_HOST = 'barmagazine.com';

/**
 * Only emit the GA snippet on production traffic to barmagazine.com.
 *
 * Previously this component ran unconditionally, which polluted GA4 with:
 *   - every dev visit to barmagazine-next.vercel.app
 *   - every preview deploy we loaded while reviewing PRs
 *   - local `next dev` sessions
 *
 * The middleware 301 now takes care of the first two cases at the edge, but
 * this guard is belt-and-suspenders in case someone weakens the middleware
 * matcher or previews get unprotected.
 */
function isProductionHost(): boolean {
  if (typeof window === 'undefined') {
    // SSR path: trust VERCEL_ENV. During `next build` for production it's 'production'.
    return process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
  }
  // Client path: require both the canonical host and production env.
  return (
    window.location.hostname === CANONICAL_HOST &&
    (process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' || process.env.NEXT_PUBLIC_VERCEL_ENV === undefined)
  );
}

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
  // Short-circuit on non-production hosts so the tag never loads at all.
  // This runs at module eval on the client; the useEffect below is therefore
  // gated on the same condition.
  const enabled = isProductionHost();

  useEffect(() => {
    if (!enabled) return;

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
  }, [enabled]);

  if (!enabled) return null;

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
