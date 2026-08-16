'use client';

import { useEffect, useState } from 'react';

/** Thin reading-progress line pinned under the fixed nav on article pages. */
export function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const total = doc.scrollHeight - doc.clientHeight;
      setProgress(total > 0 ? Math.min(1, window.scrollY / total) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="reading-progress" aria-hidden="true">
      <div className="reading-progress-fill" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}
