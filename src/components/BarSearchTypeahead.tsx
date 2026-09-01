'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { asciiFold, searchOrFilter } from '@/lib/ascii-fold';

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
 * It also completes inline: typing "jig" fills the field with "Jigger &
 * Pony", the un-typed tail selected so the next keystroke replaces it —
 * Enter mid-word opens that bar. Completion only fires on a NAME prefix
 * match (never a city or mid-string hit, which would look like the field
 * fighting the user) and never after a deletion, the classic combobox rule.
 */
export function BarSearchTypeahead({
  value,
  onChange,
  onClear,
  inputRef,
  placeholder = 'Search bars, cities, countries...',
  onSelect,
}: {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  placeholder?: string;
  /** Overrides the default navigate-to-profile: hosts that want the slug
      itself (e.g. the upgrade form) handle the selection instead. */
  onSelect?: (slug: string) => void;
}) {
  const router = useRouter();
  const [hits, setHits] = useState<Hit[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  // Monotonic ticket so a slow early response can never overwrite a newer one.
  const ticket = useRef(0);
  // The last inline completion applied: Enter navigates here while the field
  // still holds that exact name.
  const completion = useRef<Hit | null>(null);
  // True right after a deletion — completing then would fight the user.
  const deleting = useRef(false);
  // Prefix length of a completion whose tail still needs selecting once React
  // commits the completed value (an rAF can fire before the commit lands).
  const pendingSelect = useRef<number | null>(null);
  const innerRef = useRef<HTMLInputElement | null>(null);

  const q = value.trim();

  useEffect(() => {
    if (q.length < 2) {
      setHits([]);
      setOpen(false);
      setActive(-1);
      return;
    }
    // This effect refires when the inline completion rewrites the value. That
    // pass must NOT re-query: searching for the completed name collapses the
    // dropdown to that one bar, hiding the sibling matches for what the user
    // actually typed ("Apothéke" has three; completing to "Apothéke
    // Chinatown" left only one visible). Keep the typed query's list.
    if (completion.current && q === completion.current.name.trim()) return;
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
      const found = error ? [] : ((data as Hit[]) || []);
      setHits(found);
      setOpen(true);
      setActive(-1);

      // Inline completion. asciiFold maps characters 1:1, so folded prefix
      // length equals raw prefix length and slicing by q.length is safe.
      const node = innerRef.current;
      const hit = found.find(h => asciiFold(h.name).startsWith(asciiFold(q)) && h.name.length > q.length);
      if (
        hit &&
        !deleting.current &&
        node &&
        document.activeElement === node &&
        node.value.trim() === q // the user hasn't typed past this query
      ) {
        completion.current = hit;
        pendingSelect.current = q.length;
        onChange(hit.name);
      }
      // No else-clear: completing rewrites the value, which refires this
      // effect for the full name — that pass finds no longer hit and must not
      // wipe the completion Enter relies on. User edits and Escape clear it.
    }, 150);
    return () => clearTimeout(t);
  }, [q]);

  // Select the completed tail once React has committed the completed value,
  // so the next keystroke replaces it — the caret behaviour that makes inline
  // completion feel like a suggestion instead of a hijack.
  useEffect(() => {
    const c = completion.current;
    const node = innerRef.current;
    if (c && node && pendingSelect.current != null && value === c.name) {
      node.setSelectionRange(pendingSelect.current, c.name.length);
      pendingSelect.current = null;
    }
  }, [value]);

  const go = (slug: string) => {
    setOpen(false);
    if (onSelect) onSelect(slug);
    else router.push(`/bars/${slug}`);
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
      } else if (completion.current && value === completion.current.name) {
        // Enter mid-completion: the field already names one bar — open it.
        e.preventDefault();
        go(completion.current.slug);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActive(-1);
      completion.current = null;
    }
  };

  return (
    <div className="directory-search directory-search--typeahead">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.35-4.35" />
      </svg>
      <input
        ref={node => {
          innerRef.current = node;
          if (inputRef) (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => {
          // inputType, not length: typing over the selected completion tail
          // shrinks the value but is still forward typing.
          const it = (e.nativeEvent as InputEvent).inputType || '';
          deleting.current = it.startsWith('delete');
          completion.current = null;
          onChange(e.target.value);
        }}
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
