'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-auth';

/**
 * Where the sign-in email's button lands. SCANNER-SAFE BY DESIGN:
 *
 * Nothing happens on load — no token exchange, no session creation. Mail
 * scanners prefetch links, and the old auto-exchanging version let one of
 * them consume the token (and would have signed the scanner in). The
 * `token_hash` in the URL is exchanged via `verifyOtp` only when the human
 * presses the button.
 */
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [working, setWorking] = useState(false);

  const tokenHash = params.get('token_hash');
  const legacyCode = params.get('code');
  const errorDescription = params.get('error_description');

  async function signIn() {
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
          setError('That sign-in link has expired or was already used.');
          return;
        }
      } else if (legacyCode) {
        // Links mailed before the token_hash flow shipped.
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(legacyCode);
        if (exchangeError) {
          setError('That sign-in link has expired or was already used.');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.replace('/owner-dashboard');
      } else {
        setError('That sign-in link has expired or was already used.');
      }
    } catch {
      setError('Something went wrong. Please request a new link.');
    } finally {
      setWorking(false);
    }
  }

  const failed = error || errorDescription;

  return (
    <div className="add-bar-page owner-dash owner-dash--narrow">
      <div className="add-bar-form-card" style={{ textAlign: 'center' }}>
        {failed ? (
          <>
            <p className="add-bar-error">{failed}</p>
            <p style={{ marginTop: 20 }}>
              <Link href="/owner-dashboard/login" className="feature-link">
                Request a new link
              </Link>
            </p>
          </>
        ) : (
          <>
            <h1 className="owner-dash-title">Sign in to your dashboard</h1>
            <p className="owner-dash-sub">One click and you&apos;re in.</p>
            <p style={{ marginTop: 20 }}>
              <button className="add-bar-submit" onClick={signIn} disabled={working}>
                {working ? 'Signing in…' : 'Sign in'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OwnerAuthCallbackPage() {
  return (
    <Suspense fallback={<div className="add-bar-page owner-dash owner-dash--narrow"><div className="add-bar-form-card"><p>Loading…</p></div></div>}>
      <CallbackInner />
    </Suspense>
  );
}
