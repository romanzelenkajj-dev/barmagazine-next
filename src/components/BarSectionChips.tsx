/**
 * Jump chips for the bar profile: a slim sticky row under the site header
 * linking to the sections this bar actually has.
 *
 * Deliberately NOT a client component: `html { scroll-behavior: smooth }` is
 * already global, so native `#menu` anchors give the exact same smooth scroll
 * with zero JS — plus a deep-linkable hash for free. `scroll-margin-top` on
 * the targets compensates for the fixed header and this sticky row.
 *
 * Renders nothing below two sections: a single chip is not navigation, it is
 * clutter.
 */
export function BarSectionChips({
  hasMenu,
  hasPhotos,
  hasVisit,
}: {
  hasMenu: boolean;
  hasPhotos: boolean;
  hasVisit: boolean;
}) {
  const chips = [
    hasMenu && { id: 'menu', label: 'Menu' },
    hasPhotos && { id: 'photos', label: 'Photos' },
    hasVisit && { id: 'visit', label: 'Plan Your Visit' },
  ].filter(Boolean) as { id: string; label: string }[];

  if (chips.length < 2) return null;

  return (
    <nav className="bar-v2-chips" aria-label="On this page">
      {chips.map(chip => (
        <a key={chip.id} href={`#${chip.id}`} className="bar-v2-chip">
          {chip.label}
        </a>
      ))}
    </nav>
  );
}
