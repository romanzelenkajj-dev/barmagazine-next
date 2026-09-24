'use client';

import { useEffect, useState, type ReactNode } from 'react';

/**
 * The award hub's switcher and list (task 121): one edition and year at a
 * time, chosen in a white card under the band; long lists collapsed to ten
 * cards with a "Show all" button in a card.
 *
 * Every panel is in the HTML; the inactive ones are `hidden`, so a crawler
 * and a reader without JavaScript still get the default list. The
 * selection is written to the URL (?edition=world&year=2026, and
 * #open=1-50,51-100 for the expanded blocks) with history.replaceState, so
 * a shared link opens the same list without a reload here. The server
 * renders the default list; a deep link switches once the page has
 * hydrated.
 */

export interface SwitcherEdition {
  slug: string;
  label: string;
  name: string;
  years: number[];
}

export interface SwitcherBlock {
  id: string;
  label: string;
  total: number;
  head: ReactNode[];
  rest: ReactNode[];
}

export interface SwitcherPanel {
  edition: string;
  year: number;
  /** Distinct bars in the panel, for the count line. */
  total: number;
  blocks: SwitcherBlock[];
}

export function AwardHubSwitcher({
  editions,
  panels,
  defaultEdition,
  defaultYear,
}: {
  editions: SwitcherEdition[];
  panels: SwitcherPanel[];
  defaultEdition: string;
  defaultYear: number;
}) {
  const [edition, setEdition] = useState(defaultEdition);
  const [year, setYear] = useState(defaultYear);
  const [open, setOpen] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);

  const has = (e: string, y: number) => panels.some(p => p.edition === e && p.year === y);
  const yearsOf = (e: string) => editions.find(x => x.slug === e)?.years ?? [];

  // Deep links: read the URL once, after hydration.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const e = params.get('edition');
    const y = Number(params.get('year'));
    let nextEdition = edition;
    let nextYear = year;
    if (e && editions.some(x => x.slug === e)) {
      nextEdition = e;
      nextYear = y && has(e, y) ? y : yearsOf(e)[0] ?? year;
    } else if (y && has(edition, y)) {
      nextYear = y;
    }
    const m = /(?:^|[#&])open=([^&]*)/.exec(window.location.hash);
    if (nextEdition !== edition) setEdition(nextEdition);
    if (nextYear !== year) setYear(nextYear);
    if (m && m[1]) setOpen(new Set(m[1].split(',').filter(Boolean)));
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Write the selection back to the URL, never before the first read.
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams(window.location.search);
    params.set('edition', edition);
    params.set('year', String(year));
    const hash = open.size ? `#open=${Array.from(open).join(',')}` : '';
    window.history.replaceState(window.history.state, '', `${window.location.pathname}?${params}${hash}`);
  }, [edition, year, open, ready]);

  const pick = (e: string) => {
    if (e === edition) return;
    const years = yearsOf(e);
    setEdition(e);
    setYear(years.includes(year) ? year : years[0]);
    setOpen(new Set());
  };
  const pickYear = (y: number) => {
    setYear(y);
    setOpen(new Set());
  };
  const toggle = (id: string) =>
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const current = panels.find(p => p.edition === edition && p.year === year) ?? null;
  const years = yearsOf(edition);
  const editionName = editions.find(x => x.slug === edition)?.name ?? '';

  return (
    <>
      {/* The .js class lets the stylesheet hide the collapsed remainder only
          when a click can bring it back; without JavaScript the default
          list shows in full. */}
      <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />

      <div className="awards-switcher">
        {editions.length > 1 && (
          <div className="awards-editions" role="tablist" aria-label="Edition">
            {editions.map(e => (
              <button
                key={e.slug}
                type="button"
                role="tab"
                aria-selected={e.slug === edition}
                aria-label={e.name}
                className={`awards-edition-pill${e.slug === edition ? ' is-active' : ''}`}
                onClick={() => pick(e.slug)}
              >
                {e.label}
              </button>
            ))}
          </div>
        )}
        <div className="awards-switcher-row">
          {years.length > 1 ? (
            <label className="awards-year-label">
              <span>Year</span>
              <select className="awards-year-select" value={year} onChange={ev => pickYear(Number(ev.target.value))} aria-label="Year">
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </label>
          ) : (
            <span className="awards-year-static">{year}</span>
          )}
          {current && (
            <span className="awards-count">
              {editionName} {year}: {current.total} {current.total === 1 ? 'bar' : 'bars'} in our directory
            </span>
          )}
        </div>
      </div>

      {panels.map(p => {
        const active = p.edition === edition && p.year === year;
        return (
          <section
            key={`${p.edition}-${p.year}`}
            className="awards-panel"
            hidden={!active}
            aria-hidden={!active}
          >
            {p.blocks.map(b => {
              const isOpen = open.has(b.id);
              return (
                <div key={b.id} className="awards-block" id={active ? b.id : undefined}>
                  <h2 className="list-section-head">
                    <strong>{b.label}</strong>
                    <span>{b.total} {b.total === 1 ? 'bar' : 'bars'}</span>
                  </h2>
                  <div className="directory-grid">{b.head}</div>
                  {b.rest.length > 0 && (
                    <>
                      <div className="directory-grid awards-block-rest" hidden={!isOpen}>{b.rest}</div>
                      <div className="awards-more">
                        <button type="button" className="awards-more-btn" onClick={() => toggle(b.id)} aria-expanded={isOpen}>
                          {isOpen ? 'Show fewer' : `Show all ${b.total}`}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </section>
        );
      })}
    </>
  );
}
