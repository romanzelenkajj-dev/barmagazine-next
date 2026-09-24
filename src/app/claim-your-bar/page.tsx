'use client';

import Link from 'next/link';
import { createBrowserClient } from '@/lib/supabase-auth';
import { useSearchParams } from 'next/navigation';
import { gaEvent, CLAIM_EVENTS } from '@/lib/ga-event';
import { Suspense, useEffect, useState, useRef } from 'react';
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
  // The signed-in owner claimed their own bar (task 122): nothing to do but point at the dashboard.
  const [alreadyOwner, setAlreadyOwner] = useState(false);
  const [ownerLinkSent, setOwnerLinkSent] = useState(false);
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
  // True once the ?bar= lookup has finished WITHOUT selecting a bar - only
  // then may the landing render. Until it settles, a slug arrival shows the
  // neutral pending card, never a flash of the search/steps state.
  const [prefillSettled, setPrefillSettled] = useState(false);

  /**
   * THE DENOMINATOR (task 91). One event per arrival, carrying whether the
   * link brought a bar with it. 176 people reach this page in a week and 29
   * submit; this is the half of that ratio nobody was measuring, and it has
   * to live in GA4 beside the others or the ratio compares two populations.
   *
   * `bar_in_link` is the ?bar= slug being PRESENT, not it resolving: a link
   * that arrives stripped of its parameter is a link problem, and a slug
   * that arrives but fails to resolve is a data problem. They need telling
   * apart, so the resolution outcome is reported separately below.
   */
  const viewSent = useRef(false);
  /**
   * EXACTLY ONCE PER ARRIVAL. This is the denominator, so double-counting it
   * would understate the funnel and be invisible in the result.
   *
   * With no ?bar= there is nothing to wait for, so it fires on mount. With a
   * ?bar= it waits for the lookup, so the one event it does send can carry
   * whether the slug resolved. A link arriving stripped of its parameter is
   * a link problem; a slug arriving and failing to resolve is a data
   * problem, and the two need telling apart.
   */
  function sendPageView(params: { bar_in_link: boolean; resolved?: boolean }) {
    if (viewSent.current) return;
    viewSent.current = true;
    gaEvent(CLAIM_EVENTS.pageView, params);
  }
  useEffect(() => {
    if (prefillSlug) return; // deferred to the lookup below
    sendPageView({ bar_in_link: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillSlug]);

  useEffect(() => {
    if (!prefillSlug) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/claim/search?slug=${encodeURIComponent(prefillSlug)}`);
        const data = await res.json();
        const hit = (data.bars || [])[0];
        if (cancelled) return;
        if (hit) { setSelected(hit); sendPageView({ bar_in_link: true, resolved: true }); }
        else { setPrefillSettled(true); sendPageView({ bar_in_link: true, resolved: false }); }
      } catch {
        // Lookup failed; the visitor can still find the bar by search. The
        // arrival still counts, or a run of failed lookups would quietly
        // shrink the denominator.
        if (!cancelled) { setPrefillSettled(true); sendPageView({ bar_in_link: true, resolved: false }); }
      }
    })();
    return () => { cancelled = true; };
  }, [prefillSlug]);

  // Pending whenever a bar is on its way: a ?bar= slug still resolving, or a
  // typeahead pick being fetched. The landing is unreachable in either case.
  const pendingBar = (!!prefillSlug && !selected && !prefillSettled) || resolving;

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
    // Fires on every attempt, before the network call, so a submit that
    // fails still counts as an attempt. Nothing from the form is sent: no
    // email, no name, no role.
    gaEvent(CLAIM_EVENTS.submitAttempt, {});
    setSubmitting(true);
    setError('');
    try {
      // A signed-in owner sends their session along, so the server can tell
      // them they already manage the bar instead of opening a transfer.
      let token = '';
      try {
        const { data: sess } = await createBrowserClient().auth.getSession();
        token = sess.session?.access_token || '';
      } catch { /* no session: an ordinary claim */ }
      const res = await fetch('/api/claim/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ slug: selected.slug, email, name, role, newsletter_opt_in: newsletterOptIn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        gaEvent(CLAIM_EVENTS.submitResult, { outcome: 'error', status: res.status });
        return;
      }
      if (data.alreadyOwner) {
        gaEvent(CLAIM_EVENTS.submitResult, { outcome: 'already_owner' });
        setOwnerLinkSent(!!data.linkSent);
        setAlreadyOwner(true);
        return;
      }
      gaEvent(CLAIM_EVENTS.submitResult, { outcome: 'ok' });
      setDone(true);
      setProofClaimId(data.requiresProof ? data.claimId ?? null : null);
    } catch {
      setError('Network error. Please try again.');
      gaEvent(CLAIM_EVENTS.submitResult, { outcome: 'network_error' });
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
        {/* ---------- already the owner (task 122) ---------- */}
        {alreadyOwner ? (
          <>
            <span className="claim-eyebrow">Already yours</span>
            <h1>You already manage this listing</h1>
            <p className="claim-intro">
              {selected?.name} is already registered to{' '}
              {ownerLinkSent ? <strong>{email}</strong> : 'the account you are signed in with'}, so
              there is nothing to claim. Edit the listing from your dashboard.
              {ownerLinkSent && ' A sign-in link is on its way to that address.'}
            </p>
            <p style={{ textAlign: 'center', marginTop: 18 }}>
              <Link href="/owner-dashboard" className="claim-btn">Sign in to manage</Link>
            </p>
          </>
        ) : done ? (
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
        ) : pendingBar ? (
          /* ---------- neutral pending card while the bar resolves ---------- */
          <>
            <p className="claim-kicker">Claiming</p>
            <div className="claim-skeleton claim-skeleton--title" aria-hidden="true" />
            <div className="claim-skeleton claim-skeleton--line" aria-hidden="true" />
            <p className="claim-hint" style={{ textAlign: 'center' }} role="status">
              Loading your bar…
            </p>
          </>
        ) : selected ? (
          /* ---------- claim form ---------- */
          <>
            <p className="claim-kicker">Claiming</p>
            <h1 className="claim-title">{selected.name}</h1>
            <p className="claim-intro" style={{ marginBottom: 18 }}>
              {selected.city}, {selected.country}
            </p>

            {/* The way back in for an owner who lands here again (Roman, task 122). */}
            <p className="claim-note">
              Already claimed your bar? <Link href="/owner-dashboard">Sign in</Link>
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
                onNoResults={q => gaEvent(CLAIM_EVENTS.searchNoResults, { query: q })}
                onClear={() => setQuery('')}
                placeholder="Find your bar by name or city..."
                onSelect={selectBySlug}
                footer={{ label: "Don't see your bar? Add it to the directory - it's free", href: '/add-your-bar' }}
              />
            </div>
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
