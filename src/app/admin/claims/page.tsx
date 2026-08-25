'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

/**
 * Claim review queue.
 *
 * Manual (route C) claims and every transfer land here — routes A and B verify
 * themselves by email and never reach this page. Transfers are called out
 * loudly because approving one takes a listing away from its current owner.
 */

interface Proof {
  path: string;
  url: string | null;
}

interface Claim {
  id: string;
  bar_id: string;
  bar_name: string | null;
  bar_slug: string | null;
  bar_location: string | null;
  bar_has_owner: boolean;
  claimant_email: string;
  claimant_name: string | null;
  claimant_role: string | null;
  method: string;
  status: string;
  is_transfer: boolean;
  note: string | null;
  proof: Proof[];
  created_at: string;
  admin_notes: string | null;
}

const METHOD_LABEL: Record<string, string> = {
  domain_match: 'A · domain match',
  contact_on_file: 'B · contact on file',
  manual: 'C · manual',
};

export default function AdminClaimsPage() {
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'open' | 'approved' | 'rejected' | 'all'>('open');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchClaims = useCallback(async (status: string, secret: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/claims?status=${status}`, {
        headers: { 'x-admin-secret': secret },
        cache: 'no-store',
      });
      if (res.status === 401) {
        sessionStorage.removeItem('admin_secret');
        setAdminSecret(null);
        setClaims([]);
        return;
      }
      const data = await res.json();
      setClaims(data.claims || []);
    } catch {
      setClaims([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) setAdminSecret(saved);
    setAuthChecking(false);
  }, []);

  useEffect(() => {
    if (adminSecret) fetchClaims(tab, adminSecret);
  }, [tab, adminSecret, fetchClaims]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/claims?status=open', {
        headers: { 'x-admin-secret': password },
        cache: 'no-store',
      });
      if (!res.ok) throw new Error('Unauthorized');
      sessionStorage.setItem('admin_secret', password);
      setAdminSecret(password);
      setPassword('');
    } catch {
      setLoginError('Incorrect password');
    }
  }

  async function act(body: Record<string, unknown>, confirmText?: string) {
    if (!adminSecret) return;
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(String(body.claimId || body.barId));
    setMessage('');
    try {
      const res = await fetch('/api/admin/claims', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setMessage(
        res.ok
          ? data.revoked
            ? `Ownership revoked. ${data.submissionsRejected} pending edit(s) rejected.`
            : `Claim ${data.status}.`
          : data.error || 'Action failed'
      );
      fetchClaims(tab, adminSecret);
    } catch {
      setMessage('Action failed');
    } finally {
      setBusy(null);
    }
  }

  if (authChecking) return <div className="add-bar-page"><p>Checking…</p></div>;

  if (!adminSecret) {
    return (
      <div className="add-bar-page owner-dash owner-dash--narrow">
        <div className="add-bar-form-card">
          <h1 className="owner-dash-title">Claim review</h1>
          <form onSubmit={handleLogin} className="add-bar-form">
            {loginError && <p className="add-bar-error">{loginError}</p>}
            <label className="form-label" htmlFor="admin-pw">Admin password</label>
            <input
              id="admin-pw"
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit" className="add-bar-submit">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="add-bar-page owner-dash">
      <header className="owner-dash-head">
        <div>
          <h1 className="owner-dash-title">Claim review</h1>
          <p className="owner-dash-sub">
            Manual claims and transfers. Email-verified claims approve themselves and
            never appear here.
          </p>
        </div>
        <Link href="/admin/submissions" className="feature-btn feature-btn-outline">
          Bar submissions
        </Link>
      </header>

      <div className="admin-claim-tabs">
        {(['open', 'approved', 'rejected', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`admin-claim-tab${tab === t ? ' is-active' : ''}`}
          >
            {t === 'open' ? 'Needs review' : t}
          </button>
        ))}
      </div>

      {message && <p className="add-bar-success">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : claims.length === 0 ? (
        <div className="add-bar-form-card">
          <p>{tab === 'open' ? 'Nothing waiting for review.' : 'No claims here.'}</p>
        </div>
      ) : (
        <div className="owner-dash-subs">
          {claims.map(claim => (
            <article
              key={claim.id}
              className={`admin-claim${claim.is_transfer ? ' admin-claim--transfer' : ''}`}
            >
              {claim.is_transfer && (
                <p className="admin-claim-transfer-flag">
                  ⚠ Transfer — {claim.bar_name} already has an owner. Approving moves the
                  listing to this claimant and rejects the current owner&apos;s pending edits.
                </p>
              )}

              <div className="admin-claim-head">
                <div>
                  <h2 className="owner-dash-card-name">
                    {claim.bar_slug ? (
                      <Link href={`/bars/${claim.bar_slug}`}>{claim.bar_name}</Link>
                    ) : (
                      claim.bar_name || 'Unknown bar'
                    )}
                  </h2>
                  {claim.bar_location && (
                    <p className="owner-dash-card-meta">{claim.bar_location}</p>
                  )}
                </div>
                <span className="owner-dash-status admin-claim-status">
                  {METHOD_LABEL[claim.method] || claim.method}
                </span>
              </div>

              <dl className="admin-claim-fields">
                <div><dt>Claimant</dt><dd>{claim.claimant_email}</dd></div>
                <div><dt>Name</dt><dd>{claim.claimant_name || '—'}</dd></div>
                <div><dt>Role</dt><dd>{claim.claimant_role || '—'}</dd></div>
                <div><dt>Requested</dt><dd>{new Date(claim.created_at).toLocaleString()}</dd></div>
                <div><dt>Status</dt><dd>{claim.status}</dd></div>
              </dl>

              {claim.note && (
                <p className="admin-claim-note"><strong>Their note:</strong> {claim.note}</p>
              )}

              {claim.proof.length > 0 && (
                <div className="admin-claim-proof">
                  <p className="owner-dash-card-meta">
                    Proof ({claim.proof.length}) — links expire in 10 minutes
                  </p>
                  <ul>
                    {claim.proof.map(p => (
                      <li key={p.path}>
                        {p.url ? (
                          <a href={p.url} target="_blank" rel="noopener noreferrer">
                            {p.path.split('/').pop()}
                          </a>
                        ) : (
                          <span>{p.path.split('/').pop()} — could not sign</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="owner-dash-card-actions">
                {claim.status === 'pending_review' && (
                  <>
                    <button
                      className="feature-btn"
                      disabled={busy === claim.id}
                      onClick={() =>
                        act(
                          { action: 'approve', claimId: claim.id },
                          claim.is_transfer
                            ? `Transfer ${claim.bar_name} to ${claim.claimant_email}? The current owner loses access.`
                            : undefined
                        )
                      }
                    >
                      {busy === claim.id ? 'Working…' : 'Approve'}
                    </button>
                    <button
                      className="feature-btn feature-btn-outline"
                      disabled={busy === claim.id}
                      onClick={() => act({ action: 'reject', claimId: claim.id })}
                    >
                      Reject
                    </button>
                  </>
                )}
                {claim.status === 'approved' && claim.bar_has_owner && (
                  <button
                    className="admin-claim-revoke"
                    disabled={busy === claim.bar_id}
                    onClick={() =>
                      act(
                        { action: 'revoke', barId: claim.bar_id },
                        `Revoke ownership of ${claim.bar_name}? Their pending edits are rejected and they lose dashboard access.`
                      )
                    }
                  >
                    Revoke ownership
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
