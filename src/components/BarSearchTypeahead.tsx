'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { searchOrFilter } from '@/lib/ascii-fold';

interface Hit {
  slug: string;
  name: string;
  city: string;
}

/**
 * The directory search field, with a direct-navigation typeahead.
 *
 * The field stays a controlled input owned by the host directory — every
 * keystroke still flows through onChange, so the existing filter-as-you-type
 * behaviour is untouched. The dropdown is an addition on top: the top 7
 * matching bars, straight from Supabase via the same `searchOrFilter` the
 * server search uses (folded query against the generated *_ascii columns,
 * raw query against the originals — one fold implementation, not a second
 * one that could drift).
 *
 * Enter without a highlighted row does nothing beyond what the host already
 * does with the typed text; ↑↓ + Enter or a click navigates to the bar.
 */
export function BarSearchTypeahead({
  value,
  onChange,
  onClear,
  inputRef,
  placeholder = 'Search bars, cities, countries...',
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
}) {
  const router = useRouter();
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Monotonic ticket so a slow early response can never overwrite a newer one.
  const ticket = useRef(0);

  const q = value.trim();

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      setActive(-1);
      return;
    }
    const mine = ++ticket.current;
    const t = setTimeout(async () => {
      const { data, error } = await supabase
        .from('bars')
        .select('slug, name, city')
        .eq('is_active', true)
        .or(searchOrFilter(q))
        .order('name')
        .limit(7);
      if (ticket.current !== mine) return; // a newer query superseded this one
      setHits(error ? [] : ((data as Hit[]) || []));
      setOpen(true);
      setActive(-1);
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  const go = (slug: string) => {
    setOpen(false);
    router.push(`/bars/${slug}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(i => (i + 1) % Math.max(hits.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(i => (i <= 0 ? hits.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      if (active >= 0 && hits[active]) {
        e.preventDefault();
        go(hits[active].slug);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div className="directory-search directory-search--typeahead">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        onFocus={() => { if (q.length >= 2 && hits.length >= 0) setOpen(true); }}
        onBlur={() => setOpen(false)}
        role="combobox"
        aria-expanded={open}
        aria-autocomplete="list"
        aria-controls="dir-typeahead-list"
      />
      {value && (
        <button className="directory-search-clear" onClick={onClear} aria-label="Clear search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      )}
      {open && q.length >= 2 && (
        <ul className="dir-typeahead" id="dir-typeahead-list" role="listbox">
          {hits.length === 0 ? (
            <li className="dir-typeahead-empty" aria-disabled="true">No bars found</li>
          ) : (
            hits.map((hit, i) => (
              <li
                key={hit.slug}
                role="option"
                aria-selected={i === active}
                className={`dir-typeahead-item${i === active ? ' dir-typeahead-item--active' : ''}`}
                // mousedown beats the input's blur, which would close the list
                // before a click could land
                onMouseDown={e => { e.preventDefault(); go(hit.slug); }}
                onMouseEnter={() => setActive(i)}
              >
                <strong>{hit.name}</strong>
                <span>{hit.city}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
