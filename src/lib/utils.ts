/**
 * Upgrade Jetpack tiled gallery images from tiny thumbnails to large versions.
 * Replaces src with data-large-file URL for better quality.
 */
export function upgradeGalleryImages(html: string): string {
  // Replace tiny src with data-large-file for gallery images
  return html.replace(
    /(<img[^>]*?)src="[^"]*"([^>]*?data-large-file=")([^"]+)("[^>]*>)/g,
    '$1src="$3"$2$3$4'
  );
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
