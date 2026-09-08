/**
 * Status pills overlaid on a bar-card photo. One place owns the rules:
 * priority TOP 10 > 50 BEST > Featured/Premium, capped at two, so no
 * card photo wears three rows of chips. Sizing lives on
 * .bar-dir-badge-pill in globals.css - all variants share one box.
 */
export function CardStatusPills({ top10, fiftyBest, featured, premium }: {
  top10?: boolean;
  fiftyBest?: boolean;
  featured?: boolean;
  premium?: boolean;
}) {
  const pills: { key: string; label: string }[] = [];
  if (top10) pills.push({ key: 'top10', label: '★ TOP 10' });
  if (fiftyBest) pills.push({ key: '50best', label: '50 Best' });
  if (featured || premium) pills.push({ key: 'featured', label: premium ? 'Premium' : 'Featured' });
  if (pills.length === 0) return null;

  return (
    <div className="bar-dir-visual-pills">
      {pills.slice(0, 2).map(p => (
        <span key={p.key} className={`bar-dir-badge-pill bar-dir-badge-pill--${p.key}`}>
          {p.label}
        </span>
      ))}
    </div>
  );
}
