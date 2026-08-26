'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-auth';

/**
 * Where the claim email's button lands. SCANNER-SAFE BY DESIGN:
 *
 * This page does NOTHING on load — no token exchange, no session creation, no
 * writes. A live test showed a corporate mail scanner following the emailed
 * link and (in the old auto-exchanging version) completing a claim nobody
 * clicked. Scanners follow GETs; they do not press buttons. So the token
 * (`token_hash` in the URL) is exchanged via `verifyOtp` only inside the
 * click handler, and ownership is granted server-side in /api/claim/callback
 * after that.
 *
 * The only load-time request is a read-only lookup of the bar's public name,
 * so the button can say what it confirms.
 */
function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);
  const [barName, setBarName] = useState('');

  const claimId = params.get('claim');
  const tokenHash = params.get('token_hash');
  const legacyCode = params.get('code');
  const barSlug = params.get('bar');

  // Display only: the bar's public name for the button label.
  useEffect(() => {
    if (!barSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/claim/search?slug=${encodeURIComponent(barSlug)}`);
        const data = await res.json();
        if (!cancelled && data.bars?.[0]?.name) setBarName(data.bars[0].name);
      } catch {
        // The button falls back to generic wording.
      }
    })();
    return () => { cancelled = true; };
  }, [barSlug]);

  async function confirm() {
    if (!claimId) {
      setError('This link is missing its claim reference.');
      return;
    }
    setWorking(true);
    setError('');

    try {
      const supabase = createBrowserClient();

      if (tokenHash) {
        const { error: otpError } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: tokenHash,
        });
        if (otpError) {
          setError('That link has expired or was already used. Start the claim again to get a fresh one.');
          return;
        }
      } else if (legacyCode) {
        // Links mailed before the token_hash flow shipped.
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(legacyCode);
        if (exchangeError) {
          setError('That link has expired or was already used.');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setError('That link has expired or was already used.');
        return;
      }

      const res = await fetch('/api/claim/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ claimId }),
      });
      const body = await res.json();

      if (!res.ok) {
        setError(body.error || 'We could not complete this claim.');
        return;
      }

      router.replace('/owner-dashboard');
    } catch {
      setError('Something went wrong. Please try the link again.');
    } finally {
      setWorking(false);
    }
  }

  return (
    <section className="feature-section">
      <div className="feature-wrap" style={{ maxWidth: 560 }}>
        {error ? (
          <>
            <h1 className="feature-sec-title">Couldn&apos;t confirm that claim</h1>
            <p style={{ marginTop: 12 }}>{error}</p>
            <p style={{ marginTop: 20 }}>
              <Link href="/claim-your-bar" className="feature-link">Start again</Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="feature-sec-title">One click to finish</h1>
            <p style={{ marginTop: 12 }}>
              {barName
                ? <>Confirming makes you the manager of <strong>{barName}</strong> on BarMagazine.</>
                : 'Confirming completes your bar claim on BarMagazine.'}
            </p>
            <p style={{ marginTop: 20 }}>
              <button className="feature-btn" onClick={confirm} disabled={working}>
                {working
                  ? 'Confirming…'
                  : barName
                    ? `Confirm: I manage ${barName}`
                    : 'Confirm my claim'}
              </button>
            </p>
          </>
        )}
      </div>
    </section>
  );
}

export default function ClaimVerifyPage() {
  // useSearchParams needs a Suspense boundary in the app router.
  return (
    <Suspense fallback={<section className="feature-section"><div className="feature-wrap"><p>Loading…</p></div></section>}>
      <VerifyInner />
    </Suspense>
  );
}
