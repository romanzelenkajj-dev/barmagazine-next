import { describe, it, expect } from 'vitest';
import { TOP10_SLUG_RE, rankTop10Series, stripTitleMarkers, stripReadMore, postDescription, stripHtml, getFeaturedImageCaption } from './wordpress';

describe('getFeaturedImageCaption (task 111)', () => {
  const withCaption = (rendered: string | undefined) =>
    ({ _embedded: { 'wp:featuredmedia': [rendered === undefined ? {} : { caption: { rendered } }] } }) as never;

  it('returns the caption as one plain line without the theme\'s "More" link', () => {
    const wp = '<p>Boilermaker, No. 57, Goa <a class="g1-link g1-link-more" href="https://x/attachment/">More</a></p>\n';
    expect(getFeaturedImageCaption(withCaption(wp))).toBe('Boilermaker, No. 57, Goa');
  });

  it('decodes entities and collapses whitespace', () => {
    expect(getFeaturedImageCaption(withCaption('<p>Photo courtesy of The 50 Best Bars &#8211; Boilermaker\n  Goa</p>'))).toBe(
      'Photo courtesy of The 50 Best Bars – Boilermaker Goa',
    );
  });

  it('is null when the media has no caption, an empty one, or there is no media', () => {
    expect(getFeaturedImageCaption(withCaption(undefined))).toBeNull();
    expect(getFeaturedImageCaption(withCaption(''))).toBeNull();
    expect(getFeaturedImageCaption(withCaption('<p> </p>'))).toBeNull();
    expect(getFeaturedImageCaption({ _embedded: {} } as never)).toBeNull();
  });
});

const post = (slug: string, date: string, rendered: string) => ({
  slug,
  date,
  title: { rendered },
});

describe('TOP10_SLUG_RE', () => {
  it('matches real Top-10-series slugs', () => {
    for (const s of [
      'top-10-bars-in-new-york-2026',
      'top-10-bars-in-hong-kong-2025',
      'top-10-bars-in-london-2026',
      'top-10-bars-in-dubai-2025',
      'top-10-bars-in-buenos-aires-2027',
    ]) {
      expect(TOP10_SLUG_RE.test(s), s).toBe(true);
    }
  });

  it('rejects non-series slugs', () => {
    for (const s of [
      'how-to-price-a-cocktail',
      'top-10-bars-in-london',          // no year
      'top-10-cocktails-in-london-2026', // not "bars"
      'best-bars-in-new-york-2026',      // wrong prefix
      'top-10-bars-in-2026',             // no city segment
      'top-10-bars-in-london-26',        // 2-digit year
    ]) {
      expect(TOP10_SLUG_RE.test(s), s).toBe(false);
    }
  });
});

describe('stripTitleMarkers', () => {
  it('removes paired |word| WPBakery highlight markers', () => {
    expect(stripTitleMarkers('Top 10 Bars in |London| 2026')).toBe(
      'Top 10 Bars in London 2026',
    );
  });

  it('removes stray single pipes', () => {
    expect(stripTitleMarkers('Top 10 Bars in London| 2026')).toBe(
      'Top 10 Bars in London 2026',
    );
  });

  it('collapses double spaces left behind and trims', () => {
    expect(stripTitleMarkers('|Top 10|  Bars  in  |Dubai| 2025')).toBe(
      'Top 10 Bars in Dubai 2025',
    );
    expect(stripTitleMarkers('  | Hong Kong |  ')).toBe('Hong Kong');
  });

  it('is a no-op for titles without pipes', () => {
    expect(stripTitleMarkers('Top 10 Bars in New York 2026')).toBe(
      'Top 10 Bars in New York 2026',
    );
  });
});

describe('rankTop10Series', () => {
  it('newest post becomes featured; rest are series in date DESC', () => {
    const { featured, series } = rankTop10Series([
      post('top-10-bars-in-dubai-2025', '2025-06-01T00:00:00', 'Top 10 Bars in Dubai 2025'),
      post('top-10-bars-in-london-2026', '2026-05-15T00:00:00', 'Top 10 Bars in London 2026'),
      post('top-10-bars-in-hong-kong-2025', '2025-09-01T00:00:00', 'Top 10 Bars in Hong Kong 2025'),
    ]);
    expect(featured?.slug).toBe('top-10-bars-in-london-2026');
    expect(featured?.url).toBe('https://barmagazine.com/top-10-bars-in-london-2026');
    expect(series.map((s) => s.slug)).toEqual([
      'top-10-bars-in-hong-kong-2025',
      'top-10-bars-in-dubai-2025',
    ]);
  });

  it('filters out posts whose slug is not a Top-10-series slug', () => {
    const { featured, series } = rankTop10Series([
      post('how-to-price-a-cocktail', '2026-05-20T00:00:00', 'How to Price a Cocktail'),
      post('top-10-bars-in-london-2026', '2026-05-15T00:00:00', 'Top 10 Bars in London 2026'),
    ]);
    expect(featured?.slug).toBe('top-10-bars-in-london-2026');
    expect(series).toHaveLength(0);
  });

  it('caps the series list (featured excluded from the cap)', () => {
    const many = Array.from({ length: 12 }, (_, i) =>
      post(`top-10-bars-in-city${i}-20${10 + i}`, `20${10 + i}-01-01T00:00:00`, `City ${i}`),
    );
    const { featured, series } = rankTop10Series(many, 6);
    expect(featured?.slug).toBe('top-10-bars-in-city11-2021'); // newest year
    expect(series).toHaveLength(6);
  });

  it('decodes HTML entities in titles via stripHtml', () => {
    const { featured } = rankTop10Series([
      post('top-10-bars-in-hong-kong-2026', '2026-01-01T00:00:00', 'Top 10 Bars in Hong Kong &amp; Macau 2026'),
    ]);
    expect(featured?.title).toBe('Top 10 Bars in Hong Kong & Macau 2026');
  });

  it('strips WPBakery pipe markers from rendered titles end-to-end', () => {
    const { featured } = rankTop10Series([
      post('top-10-bars-in-london-2026', '2026-05-15T00:00:00', 'Top 10 Bars in |London| 2026'),
    ]);
    expect(featured?.title).toBe('Top 10 Bars in London 2026');
  });

  it('returns empty result for no matching posts (WP-down resilience)', () => {
    expect(rankTop10Series([])).toEqual({ featured: null, series: [] });
    expect(rankTop10Series([post('unrelated', '2026-01-01', 'x')])).toEqual({
      featured: null,
      series: [],
    });
  });
});

describe('stripReadMore', () => {
  it('drops the trailing More after a sentence', () => {
    expect(stripReadMore('a five-night residency, September 22-26, 2026. More')).toBe('a five-night residency, September 22-26, 2026.');
  });
  it('drops the marker with its ellipsis or bracket, any case', () => {
    expect(stripReadMore('the story continues\u2026 More')).toBe('the story continues');
    expect(stripReadMore('the story continues [\u2026] Read More')).toBe('the story continues');
    expect(stripReadMore('the story continues... Continue reading')).toBe('the story continues');
    expect(stripReadMore('the story continues [...] more')).toBe('the story continues');
  });
  it('leaves a sentence that merely ends with the word', () => {
    expect(stripReadMore('we wanted to see more of it.')).toBe('we wanted to see more of it.');
  });
  it('touches the end only', () => {
    expect(stripReadMore('More bars, more cities, more lists.')).toBe('More bars, more cities, more lists.');
  });
  it('is what stripHtml hands it from a WordPress excerpt', () => {
    const excerpt = '<p>Take over Torno Subito, September 22-26, 2026. <a class="g1-link g1-link-more" href="https://x/">More</a></p>';
    expect(stripReadMore(stripHtml(excerpt))).toBe('Take over Torno Subito, September 22-26, 2026.');
  });
});

describe('postDescription', () => {
  const excerpt = { rendered: '<p>From the excerpt, September 22-26, 2026. <a href="https://x/">More</a></p>' };
  it('prefers the SEO plugin description when present', () => {
    expect(postDescription({ excerpt, aioseo_meta_data: { description: 'From the plugin.' } })).toBe('From the plugin.');
  });
  it('falls back to the cleaned excerpt', () => {
    expect(postDescription({ excerpt, aioseo_meta_data: { description: '' } })).toBe('From the excerpt, September 22-26, 2026.');
    expect(postDescription({ excerpt })).toBe('From the excerpt, September 22-26, 2026.');
  });
  it('truncates at a word', () => {
    const long = { rendered: '<p>' + 'word '.repeat(60) + 'end. More</p>' };
    const d = postDescription({ excerpt: long });
    expect(d.length).toBeLessThanOrEqual(161);
    expect(d.endsWith('\u2026')).toBe(true);
  });
});
