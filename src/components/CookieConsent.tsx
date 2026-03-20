'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const CONSENT_KEY = 'bm_cookie_consent';

export type ConsentStatus = 'accepted' | 'rejected' | null;

export function getConsentStatus(): ConsentStatus {
  if (typeof window === 'undefined') return null;
  const val = localStorage.getItem(CONSENT_KEY);
  if (val === 'accepted' || val === 'rejected') return val;
  return null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const status = getConsentStatus();
    if (!status) {
      // Small delay so it doesn't flash on page load
      const t = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(t);
    }
  }, []);

  const handleChoice = (choice: 'accepted' | 'rejected') => {
    localStorage.setItem(CONSENT_KEY, choice);
    // Dispatch a custom event so GoogleAnalytics component can react
    window.dispatchEvent(new CustomEvent('cookie-consent-change', { detail: choice }));
    setClosing(true);
    setTimeout(() => setVisible(false), 350);
  };

  if (!visible) return null;

  return (
    <div
      className={`cookie-banner ${closing ? 'cookie-banner--closing' : ''}`}
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="cookie-banner__content">
        <p className="cookie-banner__text">
          We use cookies to analyze site traffic and improve your experience. 
          You can accept or reject non-essential cookies.{' '}
          <Link href="/privacy" className="cookie-banner__link">
            Privacy Policy
          </Link>
        </p>
        <div className="cookie-banner__actions">
          <button
            className="cookie-banner__btn cookie-banner__btn--reject"
            onClick={() => handleChoice('rejected')}
          >
            Reject
          </button>
          <button
            className="cookie-banner__btn cookie-banner__btn--accept"
            onClick={() => handleChoice('accepted')}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
