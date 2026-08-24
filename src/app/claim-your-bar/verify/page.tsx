'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-auth';

/**
 * Where the claim magic link lands.
 *
 * The link carries the Supabase session; this page turns it into a signed-in
 * client and then asks the server to finish the claim. Ownership is granted
 * server-side in /api/claim/callback — nothing here can grant it.
 */
function VerifyInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('Confirming your claim…');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const claimId = params.get('claim');
      if (!claimId) {
        if (!cancelled) setError('This link is missing its claim reference.');
        return;
      }

      const supabase = createBrowserClient();

      const code = params.get('code');
      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError && !cancelled) {
          setError('That link has expired or was already used.');
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        if (!cancelled) setError('That link has expired or was already used.');
        return;
      }

      const res = await fetch('/api/claim/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ claimId }),
      });
      const body = await res.json();
      if (cancelled) return;

      if (!res.ok) {
        setError(body.error || 'We could not complete this claim.');
        return;
      }

      setStatus('Claim confirmed — opening your dashboard…');
      router.replace('/owner-dashboard');
    })();

    return () => { cancelled = true; };
  }, [params, router]);

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
          <p>{status}</p>
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
