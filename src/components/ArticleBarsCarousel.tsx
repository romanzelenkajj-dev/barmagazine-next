import { supabase } from '@/lib/supabase';
import type { Bar } from '@/lib/supabase';
import { DirectoryBarCard } from './DirectoryBarCard';
import { MentionsArrows } from './MentionsArrows';

/**
 * "Bars in this article" on an article page (Roman, 2026-09-16): the
 * profile's mentions carousel (task 22) with the directory card (task 21)
 * for each bar the article names. Server-rendered; the arrows are the only
 * client bit. Renders nothing when the article names no bar, or when none
 * of the named rows is active any more.
 *
 * `slugs` come from article-mentions.generated.json in the order the map
 * stores them (alphabetical by name), and that order is kept. The card's
 * href is /bars/<slug>, the same as the plain list it replaces.
 */
type CardRow = Pick<Bar, 'id' | 'slug' | 'name' | 'city' | 'country' | 'state' | 'type' | 'subtypes' | 'tier' | 'accolades' | 'photos' | 'wp_article_slug'>;

export async function ArticleBarsCarousel({ slugs }: { slugs: string[] }) {
  if (slugs.length === 0) return null;
  const { data } = await supabase
    .from('bars')
    .select('id, slug, name, city, country, state, type, subtypes, tier, accolades, photos, wp_article_slug')
    .eq('is_active', true)
    .in('slug', slugs);
  const bySlug = new Map((data as CardRow[] | null)?.map(b => [b.slug, b]) ?? []);
  const bars = slugs.map(s => bySlug.get(s)).filter((b): b is CardRow => !!b);
  if (bars.length === 0) return null;

  const scrollable = bars.length > 3;
  const trackId = 'article-bars-track';
  return (
    <div className="article-bars article-bars--cards">
      <div className="bar-v2-mentions-head">
        <h3>Bars in this article</h3>
        {scrollable && <MentionsArrows trackId={trackId} />}
      </div>
      <ol
        id={trackId}
        className={`bar-v2-mentions-track${scrollable ? ' is-scrollable' : ''}`}
        tabIndex={scrollable ? 0 : undefined}
        aria-label={scrollable ? 'Bars in this article, scroll sideways' : undefined}
      >
        {bars.map(bar => (
          <li key={bar.slug}>
            <DirectoryBarCard bar={bar} />
          </li>
        ))}
      </ol>
    </div>
  );
}
