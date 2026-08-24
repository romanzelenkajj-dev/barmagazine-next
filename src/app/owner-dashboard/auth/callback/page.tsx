'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-auth';

/**
 * Landing page for the magic link.
 *
 * Supabase can deliver the session two ways depending on project settings:
 * as tokens in the URL fragment (picked up by `detectSessionInUrl`) or as a
 * `?code=` to exchange. Handle both so this keeps working if Roman flips the
 * project to PKCE.
 */
export default function OwnerAuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createBrowserClient();

      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const errorDescription = params.get('error_description');

      if (errorDescription) {
        if (!cancelled) setError(errorDescription);
        return;
      }

      if (code) {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          if (!cancelled) setError('That sign-in link has expired or was already used.');
          return;
        }
      }

      // Fragment-delivered sessions are parsed by detectSessionInUrl during
      // client construction, so by here a session should exist either way.
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;

      if (data.session) {
        // Strip the tokens from the address bar before moving on.
        router.replace('/owner-dashboard');
      } else {
        setError('That sign-in link has expired or was already used.');
      }
    })();

    return () => { cancelled = true; };
  }, [router]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {error ? (
          <>
            <p className="text-red-500 text-sm bg-red-900/20 p-4 rounded">{error}</p>
            <Link
              href="/owner-dashboard/login"
              className="inline-block mt-6 text-amber-500 hover:underline"
            >
              Request a new link
            </Link>
          </>
        ) : (
          <p className="text-gray-400">Signing you in…</p>
        )}
      </div>
    </div>
  );
}
