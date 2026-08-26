'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  name: string;
  city: string;
  country: string;
  address?: string;
  type?: string;
  website?: string;
  instagram?: string;
  email?: string;
  phone?: string;
  description?: string;
  contact_name?: string;
  status?: string;
  created_at: string;
  photo_url?: string;
  preferred_plan?: string;
}

export default function AdminSubmissionsPage() {
  // Auth: the admin secret is typed once and kept in sessionStorage (shared
  // with the Bar Directory Admin at /admin/bars) — never hardcoded in the
  // client bundle.
  const [adminSecret, setAdminSecret] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmissions = async (status: string, secret: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`, {
        headers: { 'x-admin-secret': secret },
        cache: 'no-store',
      });
      if (res.status === 401) {
        // Secret no longer valid (e.g. rotated) — force re-login
        sessionStorage.removeItem('admin_secret');
        setAdminSecret(null);
        setSubmissions([]);
        return;
      }
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem('admin_secret');
    if (saved) setAdminSecret(saved);
    setAuthChecking(false);
  }, []);

  useEffect(() => {
    if (adminSecret) fetchSubmissions(tab, adminSecret);
  }, [tab, adminSecret]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await fetch('/api/admin/submissions?status=pending', {
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
  };

  const handleAction = async (action: string, id: string) => {
    if (!adminSecret) return;
    setActionLoading(id);
    try {
      await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': adminSecret },
        body: JSON.stringify({ action, submissionId: id }),
      });
      fetchSubmissions(tab, adminSecret);
    } catch (_e) {
      alert('Action failed');
    }
    setActionLoading(null);
  };

  if (authChecking) return null;

  if (!adminSecret) {
    return (
      <div style={{ maxWidth: 380, margin: '15vh auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 8 }}>Admin: Submissions</h1>
        <p style={{ color: '#888', fontSize: 14, marginBottom: 20 }}>Enter admin password to continue</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            autoFocus
            style={{ fontSize: 15, padding: '12px 16px', border: '1.5px solid #e0d8d0', borderRadius: 10, outline: 'none', textAlign: 'center', fontFamily: 'inherit' }}
          />
          <button type="submit" style={{ fontSize: 15, fontWeight: 600, padding: '12px 20px', borderRadius: 10, border: 'none', background: '#1a1a1a', color: '#fff', cursor: 'pointer' }}>
            Sign In
          </button>
          {loginError && <p style={{ color: '#dc2626', fontSize: 13, margin: 0 }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin: Submissions</h1>
        <Link href="/admin/bars" style={{ color: '#7B1E1E', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
          Manage Bars
        </Link>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: '1.5rem' }}>
        {(['pending', 'approved', 'rejected'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 20px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              textTransform: 'capitalize',
              background: tab === t ? (t === 'pending' ? '#7B1E1E' : t === 'approved' ? '#22c55e' : '#666') : '#f0ebe5',
              color: tab === t ? '#fff' : '#666',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p style={{ color: '#888' }}>Loading...</p>
      ) : submissions.length === 0 ? (
        <p style={{ color: '#888' }}>No {tab} submissions.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {submissions.map(s => (
            <div
              key={s.id}
              style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: 12,
                padding: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{s.name}</h3>
                  <span style={{ color: '#888', fontSize: 14 }}>
                    {s.city}, {s.country} &middot; {s.type || 'Cocktail Bar'}
                  </span>
                </div>
                <span style={{ color: '#aaa', fontSize: 12 }}>
                  {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 24px', fontSize: 14, color: '#555', marginBottom: 12 }}>
                {s.address && <div><strong>Address:</strong> {s.address}</div>}
                {s.website && <div><strong>Website:</strong> <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noopener" style={{ color: '#7B1E1E' }}>{s.website}</a></div>}
                {s.instagram && <div><strong>Instagram:</strong> {s.instagram}</div>}
                {s.phone && <div><strong>Phone:</strong> {s.phone}</div>}
                {s.contact_name && <div><strong>Contact:</strong> {s.contact_name}</div>}
                {s.email && <div><strong>Email:</strong> <a href={`mailto:${s.email}`} style={{ color: '#7B1E1E' }}>{s.email}</a></div>}
              </div>

              {s.preferred_plan && s.preferred_plan !== 'free' && (
                <div style={{ display: 'inline-block', background: '#fff3cd', color: '#856404', fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 6, marginBottom: 10 }}>
                  💰 Preferred Plan: {s.preferred_plan === 'featured_social' ? 'Featured + Social ($79/mo)' : s.preferred_plan === 'featured' ? 'Featured ($39/mo)' : s.preferred_plan}
                </div>
              )}

              {s.photo_url && (
                <div style={{ marginBottom: 12 }}>
                  <a href={s.photo_url} target="_blank" rel="noopener noreferrer" className="admin-thumb">
                    <img src={s.photo_url} alt="Submitted photo" loading="lazy" />
                  </a>
                </div>
              )}

              {s.description && (
                <p style={{ fontSize: 14, color: '#666', lineHeight: 1.5, margin: '0 0 12px', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: 12 }}>
                  {s.description}
                </p>
              )}

              {/* Action buttons */}
              {tab === 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAction('approve', s.id)}
                    disabled={actionLoading === s.id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: '#22c55e', color: '#fff', fontWeight: 600, fontSize: 13,
                      opacity: actionLoading === s.id ? 0.5 : 1,
                    }}
                  >
                    {actionLoading === s.id ? 'Approving...' : 'Approve & Add to Directory'}
                  </button>
                  <button
                    onClick={() => handleAction('reject', s.id)}
                    disabled={actionLoading === s.id}
                    style={{
                      padding: '8px 20px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer',
                      background: 'transparent', color: '#888', fontWeight: 500, fontSize: 13,
                    }}
                  >
                    Reject
                  </button>
                </div>
              )}

              {tab !== 'pending' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleAction('delete', s.id)}
                    disabled={actionLoading === s.id}
                    style={{
                      padding: '6px 16px', borderRadius: 6, border: '1px solid #ddd', cursor: 'pointer',
                      background: 'transparent', color: '#aaa', fontSize: 12,
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
