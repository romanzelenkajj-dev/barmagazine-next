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
    <div className="claim-page">
      <div className="claim-card">
        <span className="claim-eyebrow">Owners</span>
        <h1>Owner sign in</h1>
        <p className="claim-intro">Manage the bar you’ve claimed.</p>

        {sent ? (
          <div className="owner-dash-sent">
            <p className="add-bar-success">
              If that address can access a bar, a sign-in link is on its way.
            </p>
            <p className="owner-dash-note">
              The link opens your dashboard directly, no password needed. It expires
              shortly, so request a new one if it stops working.
            </p>
            <p className="owner-dash-note">
              Not seeing it? Check your spam or junk folder, and mark it
              &ldquo;not spam&rdquo; so the confirmation button works.
            </p>
            <button
              onClick={() => { setSent(false); setEmail(''); }}
              className="feature-link"
            >
              Use a different address
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="claim-form">
            {error && <p className="claim-error">{error}</p>}

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

            <p style={{ textAlign: 'center', marginTop: 18 }}>
              <button
                type="submit"
                disabled={loading}
                className="claim-btn"
              >
                {loading ? 'Sending...' : 'Email me a sign-in link'}
              </button>
            </p>
          </form>
        )}

        <p className="claim-signin">
          Don&apos;t have access yet?{' '}
          <Link href="/feature-your-bar" className="feature-link">
            Get your bar listed
          </Link>
        </p>
      </div>
    </div>
  );
}
