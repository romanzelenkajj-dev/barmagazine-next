'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Search-and-claim page.
 *
 * Claiming is free and must never route to pricing — the old content here was
 * a pricing table, which is why the redirect to /feature-your-bar could only
 * be removed in the same commit that replaced this file.
 */

interface BarHit {
  slug: string;
  name: string;
  city: string;
  country: string;
  claimed: boolean;
}

export default function ClaimYourBarPage() {
  const [query, setQuery] = useState('');
  const [hits, setHits] = useState<BarHit[]>([]);
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);

  const [selected, setSelected] = useState<BarHit | null>(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set once claim-start has accepted; `proofClaimId` non-null means route C.
  const [done, setDone] = useState(false);
  const [proofClaimId, setProofClaimId] = useState<string | null>(null);
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [proofSent, setProofSent] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function runSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 2) return;
    setSearching(true);
    setError('');
    try {
      const res = await fetch(`/api/claim/search?q=${encodeURIComponent(query.trim())}`);
      const data = await res.json();
      setHits(data.bars || []);
      setSearched(true);
    } catch {
      setError('Search failed. Please try again.');
    } finally {
      setSearching(false);
    }
  }

  async function submitClaim(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/claim/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: selected.slug, email, name, role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      setDone(true);
      setProofClaimId(data.requiresProof ? data.claimId ?? null : null);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function uploadProof(e: React.FormEvent) {
    e.preventDefault();
    if (!proofClaimId || !proofFiles || proofFiles.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('claim_id', proofClaimId);
      fd.append('note', proofNote);
      Array.from(proofFiles).forEach(f => fd.append('proof', f));
      const res = await fetch('/api/claim/manual', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Upload failed');
        return;
      }
      setProofSent(true);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section className="feature-section">
      <div className="feature-wrap">
        <div className="feature-sec-head">
          <span className="feature-eyebrow">Free — no card, no plan</span>
          <h1 className="feature-sec-title">Claim your bar</h1>
          <p className="feature-sec-intro">
            Find your bar in the directory and verify you run it. You&apos;ll be able to
            keep your menu, hours, photos and contact details up to date. Claiming
            costs nothing and doesn&apos;t change how your bar is listed.
          </p>
        </div>

        {error && (
          <p style={{ padding: '10px 12px', background: '#f8d7da', color: '#721c24', borderRadius: 8 }}>
            {error}
          </p>
        )}

        {/* ---------- confirmation ---------- */}
        {done ? (
          <div style={{ maxWidth: 620 }}>
            {proofClaimId && !proofSent ? (
              <>
                <h2 style={{ fontSize: 22, marginBottom: 8 }}>One more step</h2>
                <p style={{ marginBottom: 16 }}>
                  We couldn&apos;t match your email to {selected?.name}&apos;s website or
                  contact details, so a person needs to check this one. Upload something
                  that shows you run the bar — a business registration, an email
                  signature on the bar&apos;s domain, or a dated photo from inside the
                  venue.
                </p>
                <form onSubmit={uploadProof} className="space-y-4">
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    onChange={e => setProofFiles(e.target.files)}
                    required
                  />
                  <textarea
                    className="form-input"
                    placeholder="Anything that helps us verify (optional)"
                    value={proofNote}
                    onChange={e => setProofNote(e.target.value)}
                    rows={3}
                    style={{ width: '100%', marginTop: 12 }}
                  />
                  <button className="feature-btn" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Send proof'}
                  </button>
                </form>
              </>
            ) : proofSent ? (
              <>
                <h2 style={{ fontSize: 22, marginBottom: 8 }}>Thanks — that&apos;s with us</h2>
                <p>
                  We&apos;ll review it and email you at the address you gave. Manual checks
                  are done by a person, so allow a few days.
                </p>
              </>
            ) : (
              <>
                <h2 style={{ fontSize: 22, marginBottom: 8 }}>Check your inbox</h2>
                <p>
                  If this bar is yours, a sign-in link is on its way. Following it
                  confirms the claim and opens your dashboard.
                </p>
                <p style={{ marginTop: 12, color: '#6B6B6B', fontSize: 14 }}>
                  For some bars we send the link to the contact address already on the
                  listing rather than the one you typed, so check that mailbox too.
                </p>
              </>
            )}
          </div>
        ) : selected ? (
          /* ---------- claim form ---------- */
          <div style={{ maxWidth: 560 }}>
            <p style={{ marginBottom: 4, color: '#6B6B6B', fontSize: 14 }}>Claiming</p>
            <h2 style={{ fontSize: 22, marginBottom: 16 }}>
              {selected.name} — {selected.city}, {selected.country}
            </h2>

            {selected.claimed && (
              <p style={{ padding: '10px 12px', background: '#fff3cd', color: '#856404', borderRadius: 8, marginBottom: 16 }}>
                This bar already has an owner. Your request will be reviewed by a
                person before anything changes.
              </p>
            )}

            <form onSubmit={submitClaim} className="space-y-4">
              <div>
                <label>Your email</label>
                <input
                  className="form-input" type="email" required value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@yourbar.com"
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: 13, color: '#6B6B6B', marginTop: 4 }}>
                  An address on the bar&apos;s own domain verifies fastest.
                </p>
              </div>
              <div>
                <label>Your name</label>
                <input className="form-input" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%' }} />
              </div>
              <div>
                <label>Your role</label>
                <input
                  className="form-input" value={role} onChange={e => setRole(e.target.value)}
                  placeholder="Owner, GM, bar manager…" style={{ width: '100%' }}
                />
              </div>
              <button className="feature-btn" type="submit" disabled={submitting}>
                {submitting ? 'Sending…' : 'Claim this bar'}
              </button>
              <button
                type="button"
                onClick={() => { setSelected(null); setError(''); }}
                style={{ marginLeft: 12, background: 'none', border: 0, textDecoration: 'underline', cursor: 'pointer' }}
              >
                Pick a different bar
              </button>
            </form>
          </div>
        ) : (
          /* ---------- search ---------- */
          <div style={{ maxWidth: 560 }}>
            <form onSubmit={runSearch} className="space-y-4">
              <label>Find your bar</label>
              <input
                className="form-input"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Bar name or city"
                style={{ width: '100%' }}
              />
              <button className="feature-btn" type="submit" disabled={searching}>
                {searching ? 'Searching…' : 'Search'}
              </button>
            </form>

            {searched && hits.length === 0 && (
              <p style={{ marginTop: 20 }}>
                No match. If your bar isn&apos;t listed yet,{' '}
                <Link href="/add-your-bar" className="feature-link">add it first</Link> — that&apos;s free too.
              </p>
            )}

            {hits.length > 0 && (
              <ul style={{ marginTop: 20, listStyle: 'none', padding: 0 }}>
                {hits.map(bar => (
                  <li key={bar.slug} style={{ borderTop: '1px solid #E0D8D0', padding: '12px 0' }}>
                    <button
                      onClick={() => { setSelected(bar); setError(''); }}
                      style={{ background: 'none', border: 0, textAlign: 'left', cursor: 'pointer', width: '100%' }}
                    >
                      <strong>{bar.name}</strong>
                      <span style={{ color: '#6B6B6B' }}> — {bar.city}, {bar.country}</span>
                      {bar.claimed && (
                        <span style={{ color: '#856404', fontSize: 13, display: 'block' }}>
                          already claimed — transfer requests are reviewed
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        <p style={{ marginTop: 32, fontSize: 14, color: '#6B6B6B' }}>
          Already claimed your bar?{' '}
          <Link href="/owner-dashboard/login" className="feature-link">Sign in</Link>
        </p>
      </div>
    </section>
  );
}
