/**
 * Fix WordPress content images:
 * 1. Replace lazy-load SVG placeholders with real data-src URLs
 * 2. Upgrade Jetpack tiled gallery thumbnails to data-large-file URLs
 * 3. Remove lazy-load classes that hide images
 */
export function upgradeGalleryImages(html: string): string {
  let result = html;

  // 1. Replace SVG placeholder src with data-src (lazy-load pattern from Bimber/lazysizes)
  result = result.replace(
    /<img([^>]*?)src="data:image\/svg\+xml[^"]*"([^>]*?)>/gi,
    (match, before, after) => {
      const full = before + after;
      // Try data-src first
      const dataSrcMatch = full.match(/data-src="([^"]+)/);
      if (dataSrcMatch) {
        // Remove the old src placeholder and set real src
        const cleaned = match
          .replace(/src="data:image\/svg\+xml[^"]*"/, `src="${dataSrcMatch[1]}"`)
          .replace(/class="([^"]*?)lazyload([^"]*?)"/, 'class="$1$2"');
        return cleaned;
      }
      return match;
    }
  );

  // 2. For any remaining images, prefer data-large-file over current src (Jetpack gallery upgrade)
  result = result.replace(
    /(<img[^>]*?)src="([^"]+)"([^>]*?data-large-file=")([^"]+)("[^>]*>)/g,
    (match, before, currentSrc, mid, largeUrl, after) => {
      // Only replace if current src is a small thumbnail
      if (currentSrc.includes('resize=') || currentSrc.includes('fit=150') || currentSrc.includes('w=150')) {
        return `${before}src="${largeUrl}"${mid}${largeUrl}${after}`;
      }
      return match;
    }
  );

  // 3. Also handle data-src on non-SVG placeholder images (some have tiny 1x1 gif)
  result = result.replace(
    /<img([^>]*?)src="data:image\/gif[^"]*"([^>]*?)>/gi,
    (match, before, after) => {
      const full = before + after;
      const dataSrcMatch = full.match(/data-src="([^"]+)/);
      if (dataSrcMatch) {
        return match
          .replace(/src="data:image\/gif[^"]*"/, `src="${dataSrcMatch[1]}"`)
          .replace(/class="([^"]*?)lazyload([^"]*?)"/, 'class="$1$2"');
      }
      return match;
    }
  );

  // 4. Remove srcset with data: URIs (some WP lazy loaders put placeholder in srcset too)
  result = result.replace(/srcset="data:[^"]*"/gi, '');

  // 5. Clean up lazyload class that might prevent display
  result = result.replace(/class="([^"]*?)lazyload([^"]*?)"/g, 'class="$1$2"');

  // 6. Strip inline pixel dimensions from Jetpack tiled gallery containers
  // These fixed widths/heights break responsive layout
  result = result.replace(
    /(<div[^>]*class="[^"]*(?:gallery-row|gallery-group|tiled-gallery)[^"]*"[^>]*)style="[^"]*(?:width|height):\s*\d+px[^"]*"/gi,
    '$1'
  );

  // 7. Remove width/height attributes from content images (let CSS handle sizing)
  result = result.replace(
    /(<img[^>]*?)\s+width="\d+"/gi,
    '$1'
  );
  result = result.replace(
    /(<img[^>]*?)\s+height="\d+"/gi,
    '$1'
  );

  return result;
}

export function formatCardTitle(htmlTitle: string): string {
  // Strip HTML entities and tags
  const clean = htmlTitle.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&rsquo;/g, "'").replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"').replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' ');

  // Find a good split point: after first 2-3 words
  const words = clean.split(/\s+/);
  if (words.length <= 3) return `<strong>${clean}</strong>`;

  // Look for natural break points (colon, dash, comma in first 5 words)
  for (let i = 1; i < Math.min(5, words.length); i++) {
    const word = words[i];
    if (word.endsWith(':') || word.endsWith('–') || word.endsWith('—')) {
      const bold = words.slice(0, i + 1).join(' ');
      const rest = words.slice(i + 1).join(' ');
      return `<strong>${bold}</strong> ${rest}`;
    }
  }

  // Default: bold first 2-3 words
  const splitAt = words.length > 5 ? 3 : 2;
  const bold = words.slice(0, splitAt).join(' ');
  const rest = words.slice(splitAt).join(' ');
  return `<strong>${bold}</strong> ${rest}`;
}
