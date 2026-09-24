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
        {/* Email box first (Roman, task 122): nothing stands between the
            owner and the field, then one line on how sign-in works. */}
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

            <label className="form-label" htmlFor="owner-email">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="form-input"
              id="owner-email"
              placeholder="you@yourbar.com"
              autoFocus
            />
            <p className="owner-dash-note">
              We email you a sign-in link. There is no password.
            </p>

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

        <h1 className="owner-login-title">Owner sign in</h1>
        <p className="claim-signin">
          Not claimed your bar yet?{' '}
          <Link href="/claim-your-bar" className="feature-link">
            Claim it, it&apos;s free
          </Link>
        </p>
      </div>
    </div>
  );
}
