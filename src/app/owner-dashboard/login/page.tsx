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
    <div className="add-bar-page owner-dash owner-dash--narrow">
      <div className="add-bar-form-card">
        <h1 className="owner-dash-title">Owner sign in</h1>
        <p className="owner-dash-sub">Manage the bar you’ve claimed.</p>

        {sent ? (
          <div className="owner-dash-sent">
            <p className="add-bar-success">
              If that address can access a bar, a sign-in link is on its way.
            </p>
            <p className="owner-dash-note">
              The link opens your dashboard directly — no password needed. It expires
              shortly, so request a new one if it stops working.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="feature-link"
            >
              Use a different address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="add-bar-form">
            {error && <p className="add-bar-error">{error}</p>}

            <div>
              <label className="form-label" htmlFor="owner-email">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="form-input"
                id="owner-email"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="add-bar-submit"
            >
              {loading ? 'Sending...' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        <p className="owner-dash-note">
          Don&apos;t have access yet?{' '}
          <Link href="/feature-your-bar" className="feature-link">
            Get your bar listed
          </Link>
        </p>
      </div>
    </div>
  );
}
