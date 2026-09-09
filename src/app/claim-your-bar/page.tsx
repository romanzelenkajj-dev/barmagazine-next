'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
import { BarSearchTypeahead } from '@/components/BarSearchTypeahead';

/**
 * Search-and-claim page.
 *
 * Claiming is free and must never route to pricing — the old content here was
 * a pricing table, which is why the redirect to /feature-your-bar could only
 * be removed in the same commit that replaced this file.
 *
 * VISUAL CONTRACT (Roman, 2026-09): every screen of the flow renders inside
 * one centered white card (.claim-card) — no copy directly on the beige
 * ground. Search is the directory typeahead component, not a second
 * implementation; picking a suggestion goes straight to the claim step.
 * The claim LOGIC (claim/start, token_hash + click-handler verify, proof
 * uploads) is untouched here.
 */

interface BarHit {
  slug: string;
  name: string;
  city: string;
  country: string;
  claimed: boolean;
}

export default function ClaimYourBarPage() {
  // useSearchParams needs a Suspense boundary; without one Next bails the whole
  // route out of static rendering at build time.
  return (
    <Suspense fallback={null}>
      <ClaimYourBar />
    </Suspense>
  );
}

function ClaimYourBar() {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<BarHit | null>(null);
  const [resolving, setResolving] = useState(false);

  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  // Never pre-ticked - consent is opt-in by law and by our own privacy policy.
  const [newsletterOptIn, setNewsletterOptIn] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Set once claim-start has accepted; `proofClaimId` non-null means route C.
  const [done, setDone] = useState(false);
  const [proofClaimId, setProofClaimId] = useState<string | null>(null);
  const [proofFiles, setProofFiles] = useState<FileList | null>(null);
  const [proofNote, setProofNote] = useState('');
  const [proofSent, setProofSent] = useState(false);
  const [uploading, setUploading] = useState(false);

  /**
   * Prefill from ?bar=<slug>, set by the "Is this your bar?" button on a bar
   * profile. The owner is already looking at their bar; making them search for
   * it again on arrival is the step most likely to lose them.
   *
   * A bad or inactive slug resolves to nothing and simply leaves the search
   * form as it was — no error, since the visitor did not type it.
   */
  const prefillSlug = useSearchParams().get('bar');

  useEffect(() => {
    if (!prefillSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/claim/search?slug=${encodeURIComponent(prefillSlug)}`);
        const data = await res.json();
        const hit = (data.bars || [])[0];
        if (hit && !cancelled) setSelected(hit);
      } catch {
        // Leave the search form alone; the visitor can still find the bar.
      }
    })();
    return () => { cancelled = true; };
  }, [prefillSlug]);

  /**
   * A typeahead pick hands us only the slug; the claim step also needs the
   * claimed flag (it decides the takeover-review notice), so resolve through
   * the same claim-search endpoint the prefill path uses. Claimed bars are
   * therefore never a dead end: they select fine and land on the reviewed-
   * transfer wording.
   */
  async function selectBySlug(slug: string) {
    setResolving(true);
    setError('');
    try {
      const res = await fetch(`/api/claim/search?slug=${encodeURIComponent(slug)}`);
      const data = await res.json();
      const hit = (data.bars || [])[0];
      if (hit) setSelected(hit);
      else setError('That bar could not be loaded. Please try again.');
    } catch {
      setError('That bar could not be loaded. Please try again.');
    } finally {
      setResolving(false);
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
        body: JSON.stringify({ slug: selected.slug, email, name, role, newsletter_opt_in: newsletterOptIn }),
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
    <div className="claim-page">
      <div className="claim-card">
        {/* ---------- check inbox / proof states ---------- */}
        {done ? (
          proofClaimId && !proofSent ? (
            <>
              <span className="claim-eyebrow">One more step</span>
              <h1>Prove it&apos;s your bar</h1>
              <p className="claim-intro">
                {selected?.name} already has an owner on BarMagazine, so a person
                reviews every takeover request. Upload something that shows you now
                run the bar: a business registration, an email signature on the
                bar&apos;s domain, or a dated photo from inside the venue.
              </p>
              {error && <p className="claim-error">{error}</p>}
              <form onSubmit={uploadProof} className="claim-form">
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
                  style={{ marginTop: 12 }}
                />
                <p style={{ textAlign: 'center', marginTop: 18 }}>
                  <button className="claim-btn" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading…' : 'Send proof'}
                  </button>
                </p>
              </form>
            </>
          ) : proofSent ? (
            <>
              <span className="claim-eyebrow">Received</span>
              <h1>Thanks, that&apos;s with us</h1>
              <p className="claim-intro">
                We&apos;ll review it and email you at the address you gave. Manual checks
                are done by a person, so allow a few days.
              </p>
            </>
          ) : (
            <>
              <span className="claim-eyebrow">Step 2 of 3</span>
              <h1>Check your inbox</h1>
              <p className="claim-intro">
                A confirmation email is on its way to{' '}
                <strong>{email || 'the address you gave'}</strong>. Open it and
                press the button inside; that verifies your email and makes the
                listing yours. The link is valid for 24 hours.
              </p>
              {/* Yahoo and some others disable links on mail sitting in spam,
                  so "check spam" alone is not enough — it must be moved out. */}
              <p className="claim-hint" style={{ textAlign: 'center' }}>
                Not seeing it? Check your spam or junk folder, and mark it
                &ldquo;not spam&rdquo; so the confirmation button works.
              </p>
            </>
          )
        ) : selected ? (
          /* ---------- claim form ---------- */
          <>
            <p className="claim-kicker">Claiming</p>
            <h1 className="claim-title">{selected.name}</h1>
            <p className="claim-intro" style={{ marginBottom: 18 }}>
              {selected.city}, {selected.country}
            </p>

            {selected.claimed && (
              <p className="claim-note">
                This bar already has an owner. Your request will be reviewed by a
                person before anything changes.
              </p>
            )}
            {error && <p className="claim-error">{error}</p>}

            <form onSubmit={submitClaim} className="claim-form">
              <label htmlFor="claim-email">Your email</label>
              <input
                id="claim-email"
                className="form-input" type="email" required value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@yourbar.com"
              />
              <p className="claim-hint">
                Any address works. One on the bar&apos;s own domain also marks the
                listing verified immediately.
              </p>
              <label htmlFor="claim-name">Your name</label>
              <input id="claim-name" className="form-input" value={name} onChange={e => setName(e.target.value)} />
              <label htmlFor="claim-role">Your role</label>
              <input
                id="claim-role"
                className="form-input" value={role} onChange={e => setRole(e.target.value)}
                placeholder="Owner, GM, bar manager…"
              />
              <p className="claim-fineprint">
                By claiming this listing you agree to our{' '}
                <a href="/terms" className="feature-link">Terms of Service</a> and{' '}
                <a href="/privacy" className="feature-link">Privacy Policy</a>
              </p>
              <label className="claim-consent">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={e => setNewsletterOptIn(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <span>Email me the BarMagazine newsletter (occasional, unsubscribe anytime)</span>
              </label>
              <p style={{ textAlign: 'center', margin: 0 }}>
                <button className="claim-btn" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Claim this bar'}
                </button>
              </p>
              <p style={{ textAlign: 'center', margin: '8px 0 0' }}>
                <button
                  type="button"
                  className="claim-btn-ghost"
                  onClick={() => { setSelected(null); setError(''); setQuery(''); }}
                >
                  Pick a different bar
                </button>
              </p>
            </form>
          </>
        ) : (
          /* ---------- landing: search ---------- */
          <>
            <span className="claim-eyebrow">Free &middot; No card, no plan</span>
            <h1>Claim your bar</h1>
            <p className="claim-intro">
              Find your listing and verify by email. You&apos;ll keep your hours,
              menu, photos and contact details up to date; claiming costs nothing
              and doesn&apos;t change how your bar is listed.
            </p>

            <ol className="claim-steps">
              {['Find your bar', 'Verify by email', 'Manage your listing'].map((label, i) => (
                <li key={label} className="claim-step">
                  <span className="claim-step-num">{i + 1}</span>
                  <span className="claim-step-label">{label}</span>
                </li>
              ))}
            </ol>

            {error && <p className="claim-error">{error}</p>}

            <div className="claim-search">
              <BarSearchTypeahead
                value={query}
                onChange={setQuery}
                onClear={() => setQuery('')}
                placeholder="Find your bar by name or city..."
                onSelect={selectBySlug}
                footer={{ label: "Don't see your bar? Add it to the directory - it's free", href: '/add-your-bar' }}
              />
            </div>
            {resolving && <p className="claim-hint" style={{ textAlign: 'center' }}>Loading your bar…</p>}

            <p className="claim-signin">
              Already claimed your bar?{' '}
              <Link href="/owner-dashboard/login" className="feature-link">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
