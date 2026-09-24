/**
 * Status pills overlaid on a bar-card photo, capped at two. One place
 * owns the rules: a paying bar (Featured/Premium) always keeps its chip
 * plus its single highest award (TOP 10 over 50 Best); a non-paying bar
 * shows up to two awards. Sizing lives on .bar-dir-badge-pill in
 * globals.css - all variants share one box.
 */
export function CardStatusPills({ top10, fiftyBest, featured, premium, status }: {
  top10?: boolean;
  fiftyBest?: boolean;
  featured?: boolean;
  premium?: boolean;
  /** "Temporarily closed" / "Permanently closed", from statusPill(). */
  status?: string;
}) {
  const pills: { key: string; label: string }[] = [];
  // A closed bar keeps its award pills: it did not stop being a 50 Best bar.
  // The status sits on its own row ABOVE them (Roman, 2026-09-23: inline it
  // pushed TOP 10 to the right and broke the row on Tayer + Elementary),
  // because it is the thing that changes the reader's evening.
  const award =
    top10 ? { key: 'top10', label: '★ TOP 10' } :
    fiftyBest ? { key: '50best', label: '50 Best' } : null;
  if (featured || premium) {
    if (award) pills.push(award);
    pills.push({ key: 'featured', label: premium ? 'Premium' : 'Featured' });
  } else {
    if (top10) pills.push({ key: 'top10', label: '★ TOP 10' });
    if (fiftyBest) pills.push({ key: '50best', label: '50 Best' });
  }
  if (pills.length === 0 && !status) return null;

  return (
    <div className="bar-dir-visual-pills">
      {status && (
        <span className="bar-dir-visual-pills__row">
          <span className="bar-dir-badge-pill bar-dir-badge-pill--closed">{status}</span>
        </span>
      )}
      {pills.length > 0 && (
        <span className="bar-dir-visual-pills__row">
          {pills.map(p => (
            <span key={p.key} className={`bar-dir-badge-pill bar-dir-badge-pill--${p.key}`}>
              {p.label}
            </span>
          ))}
        </span>
      )}
    </div>
  );
}
