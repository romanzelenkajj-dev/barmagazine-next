'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authHeader, signOut } from '@/lib/owner-session';
import Link from 'next/link';

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

export default function OwnerDashboardPage() {
  const router = useRouter();
  const [bars, setBars] = useState<Bar[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
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
      setOwnerEmail(data.email || '');
    } catch {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
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

      {upgradable && (
        <section className="owner-dash-section">
          <div className="owner-dash-upsell">
            <h2 className="owner-dash-upsell-title">Make this page your bar&apos;s website</h2>
            <ul className="owner-dash-upsell-list">
              <li>Full drinks menu, photo gallery and a Plan Your Visit card — reserve, WhatsApp &amp; directions on one link</li>
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
