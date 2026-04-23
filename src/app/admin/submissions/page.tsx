'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const ADMIN_SECRET = 'HAfig2WlTy5p1UlgmaBmqo60';

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
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubmissions = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/submissions?status=${status}`, {
        headers: { 'x-admin-secret': ADMIN_SECRET },
      });
      const data = await res.json();
      setSubmissions(data.submissions || []);
    } catch {
      setSubmissions([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSubmissions(tab);
  }, [tab]);

  const handleAction = async (action: string, id: string) => {
    setActionLoading(id);
    try {
      await fetch('/api/admin/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-secret': ADMIN_SECRET },
        body: JSON.stringify({ action, submissionId: id }),
      });
      fetchSubmissions(tab);
    } catch (_e) {
      alert('Action failed');
    }
    setActionLoading(null);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Admin: Submissions</h1>
        <Link href="/admin/bars" style={{ color: '#9B4A2D', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>
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
              background: tab === t ? (t === 'pending' ? '#9B4A2D' : t === 'approved' ? '#22c55e' : '#666') : '#f0ebe5',
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
                {s.website && <div><strong>Website:</strong> <a href={s.website.startsWith('http') ? s.website : `https://${s.website}`} target="_blank" rel="noopener" style={{ color: '#9B4A2D' }}>{s.website}</a></div>}
                {s.instagram && <div><strong>Instagram:</strong> {s.instagram}</div>}
                {s.phone && <div><strong>Phone:</strong> {s.phone}</div>}
                {s.contact_name && <div><strong>Contact:</strong> {s.contact_name}</div>}
                {s.email && <div><strong>Email:</strong> <a href={`mailto:${s.email}`} style={{ color: '#9B4A2D' }}>{s.email}</a></div>}
              </div>

              {s.preferred_plan && s.preferred_plan !== 'free' && (
                <div style={{ display: 'inline-block', background: '#fff3cd', color: '#856404', fontSize: 13, fontWeight: 600, padding: '4px 10px', borderRadius: 6, marginBottom: 10 }}>
                  💰 Preferred Plan: {s.preferred_plan === 'featured_social' ? 'Featured + Social ($79/mo)' : s.preferred_plan === 'featured' ? 'Featured ($39/mo)' : s.preferred_plan}
                </div>
              )}

              {s.photo_url && (
                <div style={{ marginBottom: 12 }}>
                  <img src={s.photo_url} alt="Submitted photo" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
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
