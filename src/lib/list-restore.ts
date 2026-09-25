/**
 * How far down a list the visitor was, kept on the history entry itself
 * (task 132).
 *
 * WHY history.state AND NOT sessionStorage. Each back-button stop is its own
 * history entry, and history.state belongs to exactly one of them. So pressing
 * back to /bars restores that visit, while clicking the "Bars" link in the nav
 * creates a fresh entry with nothing saved and starts at the top, as a new
 * visit should. A sessionStorage key per URL cannot tell those two apart.
 *
 * NEXT.JS OWNS THIS OBJECT TOO. The app router keeps its own tree in
 * history.state under __NA, and a replaceState WITHOUT __NA is treated as a
 * URL change it has to route. Writing the whole current state back with our
 * key added passes straight through without a re-render, and Next preserves
 * custom keys when it restores the entry on popstate. When the entry is not an
 * app-router one (no __NA) nothing is written, so this can never break
 * navigation; the worst case is that the scroll position is not restored.
 */
export interface SavedList {
  /** Cards shown, i.e. the initial page plus every "Show more" pressed. */
  shown: number;
  /** window.scrollY when last saved. */
  y: number;
  /** Server pages already appended on the unfiltered /bars list. */
  serverPage?: number;
}

const KEY = '__bmList';

export function readSavedList(): SavedList | null {
  try {
    const s = window.history.state?.[KEY];
    if (s && typeof s.shown === 'number' && typeof s.y === 'number') return s as SavedList;
  } catch { /* history unavailable: nothing to restore */ }
  return null;
}

export function writeSavedList(v: SavedList): void {
  try {
    const st = window.history.state;
    if (!st || !st.__NA) return;
    const prev = st[KEY];
    if (prev && prev.shown === v.shown && prev.y === v.y && prev.serverPage === v.serverPage) return;
    window.history.replaceState({ ...st, [KEY]: v }, '', window.location.href);
  } catch { /* Safari rate-limits replaceState; a missed save only costs precision */ }
}

/**
 * The custom part of the current entry's state, for a replaceState that
 * changes the URL. Such a call must NOT carry __NA (Next has to see the URL
 * change), and Next copies its own keys back in, but anything else passed as
 * null is dropped, which would lose the saved position.
 */
export function customHistoryState(): { [KEY]: SavedList } | null {
  const saved = readSavedList();
  return saved ? { [KEY]: saved } : null;
}

/**
 * Scroll to a saved position once the list under it is tall enough to hold
 * it. The list renders a frame or two after the data lands, and on a phone
 * images are still sizing, so this retries for a short while rather than
 * scrolling once into a page that is still too short and being clamped.
 */
export function scrollToSaved(y: number, onDone?: () => void): () => void {
  let cancelled = false;
  let tries = 0;
  const step = () => {
    if (cancelled) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    // 'instant': the site sets scroll-behavior: smooth on <html>, which would
    // otherwise animate the page down from the top on every back.
    window.scrollTo({ top: Math.min(y, Math.max(0, max)), left: 0, behavior: 'instant' as ScrollBehavior });
    tries += 1;
    if (max >= y || tries >= 20) { onDone?.(); return; }
    window.setTimeout(step, 50);
  };
  // A timer, not requestAnimationFrame: a tab restored in the background
  // gets no frames until it is shown, and the position should already be
  // right when it is.
  window.setTimeout(step, 0);
  return () => { cancelled = true; };
}
