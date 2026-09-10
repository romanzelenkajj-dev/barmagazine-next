'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { AdminValue } from '@/components/AdminMediaValue';

/**
 * Owner edit review.
 *
 * These are edits submitted from the owner dashboard. They are NOT the same
 * queue as /admin/submissions, which handles new-bar requests from the public
 * form — different table, different shape. Nothing here is live until approved.
 */

interface Diff {
  field: string;
  from: string;
  to: string;
}

interface OwnerSubmission {
  id: string;
  bar_id: string;
  bar_name: string | null;
  bar_slug: string | null;
  owner_email: string | null;
  status: string;
  submission_type: string;
  created_at: string;
  admin_notes: string | null;
  diff: Diff[];
  dropped: string[];
  no_effect: boolean;
  /** Set when the submission holds more photos than the bar's plan allows:
      the reviewer must pick which one(s) publish before approving. */
  photo_pick: { limit: number; options: string[] } | null;
}

const FIELD_LABEL: Record<string, string> = {
  address: 'Address',
  phone: 'Phone',
  email: 'Contact email',
  website: 'Website',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  reservation_url: 'Reservations link',
  menu_url: 'Menu link',
  opening_hours: 'Opening hours',
  photos: 'Photos',
};

export default function AdminOwnerEditsPage() {
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [subs, setSubs] = useState<OwnerSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected' | 'archived' | 'all'>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  // Per-submission photo selection for over-limit photo uploads.
  const [picks, setPicks] = useState<Record<string, string[]>>({});

  const fetchSubs = useCallback(async (status: string, secret: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/owner-submissions?status=${status}`, {
        headers: { 'x-admin-secret': secret },
        cache: 'no-store',
      });
      if (res.status === 401) {
        sessionStorage.removeItem('admin_secret');
        setAdminSecret(null);
        setSubs([]);
        return;
      }
      const data = await res.json();
      setSubs(data.submissions || []);
    } catch {
      setSubs([]);
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
    if (adminSecret) fetchSubs(tab, adminSecret);
  }, [tab, adminSecret, fetchSubs]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/owner-submissions?status=pending', {
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

  function togglePick(subId: string, url: string, limit: number) {
    setPicks(prev => {
      const current = prev[subId] || [];
      let next: string[];
      if (current.includes(url)) next = current.filter(u => u !== url);
      else if (current.length < limit) next = [...current, url];
      else next = limit === 1 ? [url] : current;
      return { ...prev, [subId]: next };
    });
  }

  async function act(action: string, id: string, selectedPhotos?: string[]) {
    if (!adminSecret) return;
    setBusy(id);
    setMessage('');
    try {
      const res = await fetch('/api/admin/owner-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ action, submissionId: id, selectedPhotos }),
      });
      const data = await res.json();
      setMessage(
        res.ok
          ? data.status === 'approved'
            ? `Published: ${data.applied.join(', ')}`
            : 'Rejected.'
          : data.error || 'Action failed'
      );
      fetchSubs(tab, adminSecret);
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
          <h1 className="owner-dash-title">Owner edits</h1>
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
          <h1 className="owner-dash-title">Owner edits</h1>
          <p className="owner-dash-sub">
            Changes submitted by bar owners. Nothing is live until you approve it.
          </p>
        </div>
        <div className="owner-dash-head-actions">
          <Link href="/admin/claims" className="feature-btn feature-btn-outline">Claims</Link>
          <Link href="/admin/submissions" className="feature-btn feature-btn-outline">New bars</Link>
        </div>
      </header>

      <div className="admin-claim-tabs">
        {(['pending', 'approved', 'rejected', 'archived', 'all'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`admin-claim-tab${tab === t ? ' is-active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

      {message && <p className="add-bar-success">{message}</p>}

      {loading ? (
        <p>Loading…</p>
      ) : subs.length === 0 ? (
        <div className="add-bar-form-card"><p>Nothing here.</p></div>
      ) : (
        <div className="owner-dash-subs">
          {subs.map(sub => (
            <article key={sub.id} className="admin-claim">
              <div className="admin-claim-head">
                <div>
                  <h2 className="owner-dash-card-name">
                    {sub.bar_slug ? (
                      <Link href={`/bars/${sub.bar_slug}`}>{sub.bar_name}</Link>
                    ) : (
                      sub.bar_name || 'Unknown bar'
                    )}
                  </h2>
                  <p className="owner-dash-card-meta">
                    {sub.owner_email} · {new Date(sub.created_at).toLocaleString()}
                  </p>
                </div>
                <span className="owner-dash-status admin-claim-status">
                  {sub.submission_type === 'photo_upload' ? 'Photos' : 'Details'} · {sub.status}
                </span>
              </div>

              {sub.dropped.length > 0 && (
                <p className="admin-claim-note">
                  <strong>Not applicable:</strong> {sub.dropped.join(', ')}. Outside the owner
                  allowlist and will not be written.
                </p>
              )}

              {sub.no_effect ? (
                <p className="admin-claim-note">
                  Nothing differs from what is already live.
                </p>
              ) : (
                <table className="admin-diff">
                  <thead>
                    <tr><th>Field</th><th>Now</th><th>Proposed</th></tr>
                  </thead>
                  <tbody>
                    {sub.diff.map(d => (
                      <tr key={d.field}>
                        <td>{FIELD_LABEL[d.field] || d.field}</td>
                        <td className="admin-diff-from">{d.from ? <AdminValue value={d.from} /> : <em>empty</em>}</td>
                        <td className="admin-diff-to">{d.to ? <AdminValue value={d.to} /> : <em>cleared</em>}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {sub.admin_notes && (
                <p className="admin-claim-note"><strong>Note:</strong> {sub.admin_notes}</p>
              )}

              {sub.status === 'pending' && sub.photo_pick && (
                <div style={{ marginTop: 12 }}>
                  <p className="admin-claim-note">
                    <strong>
                      This bar&apos;s plan includes {sub.photo_pick.limit} profile photo
                      {sub.photo_pick.limit > 1 ? 's' : ''}.
                    </strong>{' '}
                    Pick which one publishes; the others stay stored on the submission
                    (they publish if the bar upgrades to Featured).
                  </p>
                  <div className="admin-thumbs" style={{ marginTop: 8 }}>
                    {sub.photo_pick.options.map(url => {
                      const chosen = (picks[sub.id] || []).includes(url);
                      return (
                        <button
                          key={url}
                          type="button"
                          onClick={() => togglePick(sub.id, url, sub.photo_pick!.limit)}
                          className="admin-thumb"
                          aria-pressed={chosen}
                          style={{
                            padding: 0,
                            background: 'none',
                            cursor: 'pointer',
                            borderRadius: 10,
                            border: chosen ? '3px solid #7B1E1E' : '3px solid transparent',
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="Submitted photo" loading="lazy" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {sub.status === 'pending' && (
                <div className="owner-dash-card-actions">
                  <button
                    className="feature-btn"
                    disabled={
                      busy === sub.id ||
                      sub.no_effect ||
                      (!!sub.photo_pick && (picks[sub.id] || []).length !== sub.photo_pick.limit)
                    }
                    onClick={() => act('approve', sub.id, sub.photo_pick ? picks[sub.id] : undefined)}
                    title={
                      sub.no_effect
                        ? 'Nothing to publish'
                        : sub.photo_pick && (picks[sub.id] || []).length !== sub.photo_pick.limit
                          ? 'Pick which photo publishes first'
                          : undefined
                    }
                  >
                    {busy === sub.id ? 'Working…' : 'Approve & publish'}
                  </button>
                  <button
                    className="feature-btn feature-btn-outline"
                    disabled={busy === sub.id}
                    onClick={() => act('reject', sub.id)}
                  >
                    Reject
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
