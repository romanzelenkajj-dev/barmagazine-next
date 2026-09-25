'use client';

import { useEffect, useRef } from 'react';
import { writeSavedList } from '@/lib/list-restore';

/**
 * Keep the current history entry's saved list position up to date (task 132).
 *
 * Saves on scroll (after it settles), whenever the number of cards shown
 * changes, and on any click, which runs before a card's navigation pushes the
 * next entry, so the position recorded is the one the visitor left from.
 *
 * `active` stays false until a pending restore has finished; saving earlier
 * would record the top of a list that is still loading and overwrite the
 * position being restored.
 */
export function useListPositionSaver(shown: number, serverPage: number | undefined, active: boolean): void {
  const latest = useRef({ shown, serverPage });
  latest.current = { shown, serverPage };

  useEffect(() => {
    if (!active) return;
    const save = () => writeSavedList({
      shown: latest.current.shown,
      y: Math.round(window.scrollY),
      serverPage: latest.current.serverPage,
    });
    save();
    let timer: number | undefined;
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(save, 150);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', save, true);
    window.addEventListener('pagehide', save);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', save, true);
      window.removeEventListener('pagehide', save);
    };
  }, [active, shown, serverPage]);
}
