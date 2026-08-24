'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Owner sign-in. No password and no self-registration: an account exists only
 * because a bar was claimed, so this asks for an address and mails a link.
 * The response is the same either way, so the form can't be used to work out
 * which addresses have access.
 */
export default function OwnerLoginPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setSent(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold">Bar Magazine</Link>
          <h1 className="text-xl mt-4">Owner Sign In</h1>
        </div>

        {sent ? (
          <div className="space-y-4 text-center">
            <p className="text-green-500 text-sm bg-green-900/20 p-4 rounded">
              If that address can access a bar, a sign-in link is on its way.
            </p>
            <p className="text-gray-400 text-sm">
              The link opens your dashboard directly — no password needed. It expires
              shortly, so request a new one if it stops working.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="text-amber-500 hover:underline text-sm"
            >
              Use a different address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm bg-red-900/20 p-3 rounded">{error}</p>}

            <div>
              <label className="block text-sm text-gray-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full bg-gray-900 border border-gray-700 rounded px-4 py-2 text-white focus:border-amber-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-50 py-2 rounded font-medium"
            >
              {loading ? 'Sending...' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        <p className="text-center text-gray-400 text-sm mt-6">
          Don&apos;t have access yet?{' '}
          <Link href="/feature-your-bar" className="text-amber-500 hover:underline">
            Get your bar listed
          </Link>
        </p>
      </div>
    </div>
  );
}
