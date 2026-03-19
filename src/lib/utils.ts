export function toUrlSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function fromUrlSlug(slug: string): string {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

/**
 * Format bar type from DB value to display label.
 * Handles snake_case ("cocktail_bar" → "Cocktail Bar") and already-formatted values.
 */
export function formatBarType(type: string): string {
  if (!type) return '';
  // If it contains underscores, it's snake_case — convert
  if (type.includes('_')) {
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  }
  return type;
}

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

  // 6. Replace Jetpack tiled galleries with clean responsive HTML
  // Loop to handle multiple galleries in one article
  let safetyCounter = 0;
  while (safetyCounter < 10) {
    const galleryStart = result.search(/<div[^>]*class="[^"]*tiled-gallery[^"]*"/i);
    if (galleryStart === -1) break;
    safetyCounter++;
    // Find the end of this gallery by counting div depth
    let depth = 0;
    let idx = galleryStart;
    let galleryEnd = result.length;
    while (idx < result.length) {
      if (result.slice(idx, idx + 4) === '<div') {
        depth++;
        idx += 4;
      } else if (result.slice(idx, idx + 6) === '</div>') {
        depth--;
        if (depth === 0) {
          galleryEnd = idx + 6;
          break;
        }
        idx += 6;
      } else {
        idx++;
      }
    }
    const galleryHtml = result.slice(galleryStart, galleryEnd);
    const rebuilt = rebuildTiledGallery(galleryHtml);
    result = result.slice(0, galleryStart) + rebuilt + result.slice(galleryEnd);
  }

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

/**
 * Parse a Jetpack tiled gallery and rebuild as a clean flex layout.
 * Preserves original row/group width ratios for proper tiling.
 */
function rebuildTiledGallery(html: string): string {
  // Collect captions
  const captions: string[] = [];
  const captionRegex = /<div[^>]*tiled-gallery-caption[^>]*>([^<]*)<\/div>/gi;
  let capMatch;
  while ((capMatch = captionRegex.exec(html)) !== null) {
    captions.push(capMatch[1].trim());
  }

  // Collect images
  interface GalleryImage { src: string; alt: string; caption: string; }
  const images: GalleryImage[] = [];
  const imgRegex = /<img[^>]+>/gi;
  let imgMatch;
  let imgIdx = 0;
  while ((imgMatch = imgRegex.exec(html)) !== null) {
    const tag = imgMatch[0];
    const origSrc = tag.match(/data-orig-file="([^"]+)/);
    const largeSrc = tag.match(/data-large-file="([^"]+)/);
    const regularSrc = tag.match(/src="([^"]+)/);
    const alt = tag.match(/alt="([^"]*)/)?.[1] || '';
    const src = origSrc?.[1] || largeSrc?.[1] || regularSrc?.[1] || '';
    if (src && !src.startsWith('data:')) {
      images.push({ src, alt, caption: captions[imgIdx] || '' });
      imgIdx++;
    }
  }

  if (images.length === 0) return html;

  // Parse row/group structure
  const rowSections = html.split(/(?=<div[^>]*class="gallery-row")/i).filter(s => s.includes('gallery-row'));
  let globalImgIdx = 0;
  const rowLayouts: { images: GalleryImage[]; flex: number }[][] = [];

  for (const rowHtml of rowSections) {
    const rowWidthMatch = rowHtml.match(/gallery-row"[^>]*style="[^"]*width:\s*(\d+)px/);
    const rowWidth = rowWidthMatch ? parseInt(rowWidthMatch[1]) : 662;
    const groupMatches: RegExpExecArray[] = [];
    const groupRegex = /gallery-group\s+images-(\d+)"[^>]*style="[^"]*width:\s*(\d+)px/g;
    let gMatch;
    while ((gMatch = groupRegex.exec(rowHtml)) !== null) {
      groupMatches.push(gMatch);
    }
    const row: { images: GalleryImage[]; flex: number }[] = [];

    for (const gm of groupMatches) {
      const count = parseInt(gm[1]);
      const groupWidth = parseInt(gm[2]);
      const groupImages: GalleryImage[] = [];
      for (let j = 0; j < count && globalImgIdx < images.length; j++) {
        groupImages.push(images[globalImgIdx++]);
      }
      row.push({ images: groupImages, flex: groupWidth / rowWidth });
    }
    if (row.length > 0) rowLayouts.push(row);
  }

  // Build clean HTML
  let out = '<div class="gallery-clean">';
  for (const row of rowLayouts) {
    out += '<div class="gallery-clean-row">';
    for (const group of row) {
      const flexVal = Math.round(group.flex * 1000);
      if (group.images.length === 1) {
        const img = group.images[0];
        out += `<div class="gallery-clean-cell" style="flex:${flexVal} 1 0%">`;
        out += `<img src="${img.src}" alt="${img.alt}" loading="lazy" />`;
        if (img.caption) out += `<span class="gallery-clean-cap">${img.caption}</span>`;
        out += '</div>';
      } else {
        out += `<div class="gallery-clean-cell gallery-clean-stack" style="flex:${flexVal} 1 0%">`;
        for (const img of group.images) {
          out += '<div class="gallery-clean-stack-item">';
          out += `<img src="${img.src}" alt="${img.alt}" loading="lazy" />`;
          if (img.caption) out += `<span class="gallery-clean-cap">${img.caption}</span>`;
          out += '</div>';
        }
        out += '</div>';
      }
    }
    out += '</div>';
  }
  out += '</div>';
  return out;
}

export function formatCardTitle(htmlTitle: string, boldTitle?: string): string {
  // If a bold_title custom field is set in WP, use it directly
  // (it contains HTML like "<strong>Bold Part</strong> Regular Part")
  if (boldTitle && boldTitle.trim()) {
    return boldTitle.trim();
  }

  // Decode HTML entities (keep HTML tags intact)
  const decoded = htmlTitle
    .replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&#8211;/g, '–').replace(/&#8212;/g, '—').replace(/&nbsp;/g, ' ');

  // If title already has <strong> or <b> tags, preserve them
  if (/<strong>|<b>/i.test(decoded)) {
    return decoded;
  }

  // Strip remaining HTML tags for plain-text processing
  const clean = decoded.replace(/<[^>]*>/g, '');

  // If title contains two pipe markers, bold the text between them
  // e.g. "|Bold Part| rest of title" or "start |Bold Part| end"
  const pipeMatch = clean.match(/^(.*?)\|(.+?)\|(.*)$/);
  if (pipeMatch) {
    const before = pipeMatch[1].trim();
    const bold = pipeMatch[2].trim();
    const after = pipeMatch[3].trim();
    const parts = [before, `<strong>${bold}</strong>`, after].filter(Boolean);
    return parts.join(' ');
  }

  // If a stray single pipe exists, just strip it out
  return clean.replace(/\|/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Strip pipe markers from title without adding bold formatting.
 * Use everywhere EXCEPT the homepage (which uses formatCardTitle for bold).
 */
export function cleanTitle(htmlTitle: string): string {
  const decoded = htmlTitle
    .replace(/&amp;/g, '&').replace(/&#8217;/g, "'").replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'").replace(/&rdquo;/g, '"').replace(/&ldquo;/g, '"')
    .replace(/&#8211;/g, '\u2013').replace(/&#8212;/g, '\u2014').replace(/&nbsp;/g, ' ');
  return decoded.replace(/<[^>]*>/g, '').replace(/\|/g, '').replace(/\s+/g, ' ').trim();
}
