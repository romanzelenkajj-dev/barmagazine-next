'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

import AdminClaimsPage from '../claims/page';
import AdminOwnerEditsPage from '../owner-edits/page';
import AdminSubmissionsPage from '../submissions/page';

/**
 * One inbox for everything waiting on a decision.
 *
 * Three queues sit on three different tables — claims on `bar_claims`, owner
 * edits on `owner_submissions`, new bars on `bar_submissions` — which is why
 * they were three pages. That split made sense to the schema and not to the
 * person using it: a pending owner edit was undiscoverable unless you already
 * knew which of four admin URLs to open.
 *
 * The queue components are the existing pages, composed rather than rewritten,
 * so the approve rules (plan→tier mapping on new bars, transfer confirmation on
 * claims, the allowlist on owner edits) stay exactly as they are. They all read
 * the same `admin_secret` session key, so signing in on one signs in on all.
 *
 * /admin/bars stays separate on purpose: editing live data is a different act
 * from approving someone else's proposal, and merging them would put a
 * publishes-immediately control next to a needs-approval one.
 */

type Tab = 'claims' | 'edits' | 'bars';

const TABS: { id: Tab; label: string }[] = [
  { id: 'claims', label: 'Claims' },
  { id: 'edits', label: 'Owner edits' },
  { id: 'bars', label: 'New bars' },
];

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const initial = (params.get('tab') as Tab) || 'claims';
  const [tab, setTab] = useState<Tab>(TABS.some(t => t.id === initial) ? initial : 'claims');
  const [counts, setCounts] = useState<Record<Tab, number | null>>({
    claims: null,
    edits: null,
    bars: null,
  });

  /** Counts are advisory — a failed one shows no badge rather than a zero. */
  const loadCounts = useCallback(async () => {
    const secret = sessionStorage.getItem('admin_secret');
    if (!secret) return;
    const headers = { 'x-admin-secret': secret };

    const count = async (url: string, key: string) => {
      try {
        const res = await fetch(url, { headers, cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return (data[key] || []).length as number;
      } catch {
        return null;
      }
    };

    const [claims, edits, bars] = await Promise.all([
      count('/api/admin/claims?status=open', 'claims'),
      count('/api/admin/owner-submissions?status=pending', 'submissions'),
      count('/api/admin/submissions?status=pending', 'submissions'),
    ]);
    setCounts({ claims, edits, bars });
  }, []);

  useEffect(() => {
    loadCounts();
    // Re-count when the tab changes: acting in one queue changes its count.
  }, [loadCounts, tab]);

  function select(next: Tab) {
    setTab(next);
    router.replace(`/admin/review?tab=${next}`, { scroll: false });
  }

  return (
    <div className="admin-review">
      <div className="admin-review-bar">
        <div className="admin-review-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => select(t.id)}
              className={`admin-review-tab${tab === t.id ? ' is-active' : ''}`}
            >
              {t.label}
              {counts[t.id] ? <span className="admin-review-count">{counts[t.id]}</span> : null}
            </button>
          ))}
        </div>
        <Link href="/admin/bars" className="admin-review-editor-link">
          Bar editor →
        </Link>
      </div>

      {tab === 'claims' && <AdminClaimsPage />}
      {tab === 'edits' && <AdminOwnerEditsPage />}
      {tab === 'bars' && <AdminSubmissionsPage />}
    </div>
  );
}

export default function AdminReviewPage() {
  return (
    <Suspense fallback={<div className="add-bar-page"><p>Loading…</p></div>}>
      <ReviewInner />
    </Suspense>
  );
}
