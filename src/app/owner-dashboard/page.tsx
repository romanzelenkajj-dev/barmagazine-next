'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHeader, signOut } from '@/lib/owner-session';
import Link from 'next/link';
import { BarBadgeEmbed } from '@/components/BarBadgeEmbed';

/**
 * Owner dashboard.
 *
 * Styled with the site's own system (--bg-page, --bg-card, --radius, --accent)
 * and the .add-bar-* family, rather than raw Tailwind utilities. It used to be
 * a black page with 4px corners inside a warm cream site.
 */

interface Bar {
  id: string;
  name: string;
  slug: string;
  status: string;
  tier: string | null;
  address: string;
  neighborhood: string;
  featured_image: string;
  updated_at: string;
}

interface Submission {
  id: string;
  bar_id: string;
  status: string;
  submitted_data: Record<string, unknown>;
  created_at: string;
}

const STATUS_TONE: Record<string, { bg: string; fg: string }> = {
  approved: { bg: '#d4edda', fg: '#155724' },
  rejected: { bg: '#f8d7da', fg: '#721c24' },
  pending: { bg: '#fff3cd', fg: '#856404' },
};

interface PendingClaim {
  id: string;
  barName: string;
  barSlug: string | null;
}

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [bars, setBars] = useState<Bar[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([]);
  const [finishing, setFinishing] = useState<string | null>(null);
  const [claimErrors, setClaimErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');

  useEffect(() => {
    (async () => {
      const headers = await authHeader();
      if (!headers) {
        router.push('/owner-dashboard/login');
        return;
      }
      fetchDashboardData(headers);
    })();
  }, [router]);

  async function fetchDashboardData(headers: { Authorization: string }) {
    try {
      const res = await fetch('/api/owner/bars', { headers });
      if (res.status === 401) {
        await signOut();
        router.push('/owner-dashboard/login');
        return;
      }
      const data = await res.json();
      setBars(data.bars || []);
      setSubmissions(data.submissions || []);
      setPendingClaims(data.pendingClaims || []);
      setOwnerEmail(data.email || '');
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }

  // Completing a claim from here reuses the email link's endpoint: being
  // signed in as the claim's address is the same proof the link established,
  // so someone whose emailed link died can still finish.
  async function finishClaim(claimId: string) {
    const headers = await authHeader();
    if (!headers) {
      router.push('/owner-dashboard/login');
      return;
    }
    setFinishing(claimId);
    setClaimErrors(prev => ({ ...prev, [claimId]: '' }));
    try {
      const res = await fetch('/api/claim/callback', {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId }),
      });
      const body = await res.json();
      if (!res.ok) {
        const hint =
          res.status === 410
            ? ' Start the claim again from your bar’s page and we’ll send a fresh link.'
            : '';
        setClaimErrors(prev => ({
          ...prev,
          [claimId]: (body.error || 'We could not finish this claim.') + hint,
        }));
        return;
      }
      await fetchDashboardData(headers);
    } catch {
      setClaimErrors(prev => ({ ...prev, [claimId]: 'Something went wrong. Please try again.' }));
    } finally {
      setFinishing(null);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push('/owner-dashboard/login');
  }

  const barName = (id: string) => bars.find(b => b.id === id)?.name || 'your bar';

  // The upsell shows only while there is something to upsell: free and top10
  // are unpaid tiers; featured/social owners already bought it.
  const upgradable = bars.find(b => b.tier === 'free' || b.tier === 'top10');

  if (loading) {
    return (
      <div className="add-bar-page">
        <div className="add-bar-form-card">
          <p>Loading your bars…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-bar-page owner-dash">
      <header className="owner-dash-head">
        <div>
          <h1 className="owner-dash-title">Your bars</h1>
          {ownerEmail && <p className="owner-dash-sub">Signed in as {ownerEmail}</p>}
        </div>
        <div className="owner-dash-head-actions">
          <Link href="/" className="feature-btn feature-btn-outline">Back to site</Link>
          <button onClick={handleLogout} className="owner-dash-signout">Sign out</button>
        </div>
      </header>

      {error && <p className="add-bar-error">{error}</p>}

      {pendingClaims.length > 0 && (
        <section className="owner-dash-section">
          <h2 className="owner-dash-section-title">Finish claiming</h2>
          {pendingClaims.map(claim => (
            <div key={claim.id} className="add-bar-form-card">
              <p>
                Your claim of <strong>{claim.barName}</strong> is one step from done.
                You&apos;re signed in with the address the claim used, so you can finish it here —
                no email link needed.
              </p>
              <p style={{ marginTop: 16 }}>
                <button
                  className="feature-btn"
                  onClick={() => finishClaim(claim.id)}
                  disabled={finishing === claim.id}
                >
                  {finishing === claim.id ? 'Finishing…' : `Finish claiming ${claim.barName}`}
                </button>
              </p>
              {claimErrors[claim.id] && <p className="add-bar-error">{claimErrors[claim.id]}</p>}
            </div>
          ))}
        </section>
      )}

      <section className="owner-dash-section">
        {bars.length === 0 ? (
          <div className="add-bar-form-card">
            <h2 className="owner-dash-section-title">No bars yet</h2>
            <p>
              Once you&apos;ve claimed a bar it appears here.{' '}
              <Link href="/claim-your-bar" className="feature-link">Claim your bar</Link> — it&apos;s free.
            </p>
          </div>
        ) : (
          <div className="owner-dash-grid">
            {bars.map(bar => (
              <article key={bar.id} className="owner-dash-card">
                {bar.featured_image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bar.featured_image} alt="" className="owner-dash-card-img" />
                )}
                <div className="owner-dash-card-body">
                  <h2 className="owner-dash-card-name">{bar.name}</h2>
                  {bar.address && <p className="owner-dash-card-meta">{bar.address}</p>}
                  <div className="owner-dash-card-actions">
                    <Link href={`/owner-dashboard/edit/${bar.slug}`} className="feature-btn">
                      Edit details
                    </Link>
                    <Link href={`/bars/${bar.slug}`} className="feature-btn feature-btn-outline">
                      View listing
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {bars.length > 0 && (
        <section className="owner-dash-section">
          {bars.map(bar => (
            <BarBadgeEmbed key={bar.id} slug={bar.slug} name={bar.name} />
          ))}
        </section>
      )}

      {upgradable && (
        <section className="owner-dash-section">
          <div className="owner-dash-upsell">
            <h2 className="owner-dash-upsell-title">Make this page your bar&apos;s website</h2>
            <ul className="owner-dash-upsell-list">
              <li>Your complete drinks menu and a photo gallery, published on your page</li>
              <li>A feature article about your bar in the magazine</li>
              <li>Featured + Social adds promotion to our 88,000+ Instagram audience</li>
            </ul>
            <Link
              href={`/feature-your-bar?bar=${upgradable.slug}#pricing`}
              className="feature-btn"
            >
              See Featured plans
            </Link>
          </div>
        </section>
      )}

      <section className="owner-dash-section">
        <h2 className="owner-dash-section-title">Pending changes</h2>
        {submissions.length === 0 ? (
          <div className="add-bar-form-card">
            <p>
              Nothing waiting. Edits you submit are reviewed before they go live,
              and show up here until then.
            </p>
          </div>
        ) : (
          <div className="owner-dash-subs">
            {submissions.map(sub => {
              const tone = STATUS_TONE[sub.status] || STATUS_TONE.pending;
              return (
                <div key={sub.id} className="owner-dash-sub">
                  <div>
                    <p className="owner-dash-sub-title">{barName(sub.bar_id)}</p>
                    <p className="owner-dash-card-meta">
                      Submitted {new Date(sub.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className="owner-dash-status"
                    style={{ background: tone.bg, color: tone.fg }}
                  >
                    {sub.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
