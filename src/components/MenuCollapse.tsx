'use client';

import { useState } from 'react';

/**
 * Collapses the tail of a long menu. The children are server-rendered and
 * stay in the DOM either way — hidden with max-height/overflow, not removed —
 * so the full menu remains in the HTML for search engines and the schema.org
 * markup built from it stays truthful.
 *
 * One-way: the button expands and disappears. Nobody reading a menu wants to
 * fold it back up.
 */
export function MenuCollapse({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className={`bar-v2-menu-more${open ? ' bar-v2-menu-more--open' : ''}`}>
        {children}
      </div>
      {!open && (
        <button
          type="button"
          className="bar-v2-menu-expand"
          onClick={() => setOpen(true)}
        >
          Show full menu ↓
        </button>
      )}
    </>
  );
}
