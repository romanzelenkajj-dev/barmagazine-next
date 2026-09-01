'use client';

import { useState } from 'react';

/**
 * "Find us on BarMagazine" embed block for the owner dashboard.
 *
 * Every claimed bar that pastes this on its own site is a backlink from a
 * real bar domain, which is the point. So the copy step is one click: the
 * button puts the COMPLETE anchor + image HTML on the clipboard, nothing to
 * assemble. Two variants only, light and dark, both served from our domain.
 */

const SITE_URL = 'https://barmagazine.com';

function snippetFor(slug: string, name: string, variant: 'light' | 'dark'): string {
  const profile = `${SITE_URL}/bars/${slug}?utm_source=bar_badge`;
  const img = `${SITE_URL}/badges/barmagazine-badge-${variant}.svg`;
  return `<a href="${profile}" title="${name} on BarMagazine"><img src="${img}" alt="Find ${name} on BarMagazine" width="220" height="56" style="border:0"/></a>`;
}

export function BarBadgeEmbed({ slug, name }: { slug: string; name: string }) {
  const [copied, setCopied] = useState<'light' | 'dark' | null>(null);

  async function copy(variant: 'light' | 'dark') {
    try {
      await navigator.clipboard.writeText(snippetFor(slug, name, variant));
      setCopied(variant);
      setTimeout(() => setCopied(c => (c === variant ? null : c)), 2000);
    } catch {
      // Clipboard can be unavailable (permissions, old browser); the
      // fallback is the visible snippet below, selectable by hand.
      setCopied(null);
    }
  }

  return (
    <div className="badge-embed">
      <h3 className="badge-embed-title">Your BarMagazine badge</h3>
      <p className="badge-embed-sub">
        Paste this on your website to link {name}&apos;s profile. Copy is one click; the
        badge is served from barmagazine.com, so it always stays current.
      </p>
      <div className="badge-embed-variants">
        {(['dark', 'light'] as const).map(variant => (
          <div key={variant} className={`badge-embed-variant badge-embed-variant--${variant}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/badges/barmagazine-badge-${variant}.svg`}
              alt={`Find us on BarMagazine (${variant} badge)`}
              width={220}
              height={56}
            />
            <button type="button" className="feature-btn feature-btn-outline badge-embed-copy" onClick={() => copy(variant)}>
              {copied === variant ? 'Copied' : `Copy ${variant} badge HTML`}
            </button>
          </div>
        ))}
      </div>
      <textarea
        className="badge-embed-code"
        readOnly
        rows={3}
        value={snippetFor(slug, name, 'dark')}
        onFocus={e => e.target.select()}
        aria-label="Badge embed HTML"
      />
    </div>
  );
}
