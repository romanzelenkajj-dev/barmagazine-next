/**
 * Media-aware value rendering for the admin review queues.
 *
 * Submitted values arrive as plain strings — sometimes a lone image URL,
 * sometimes a comma-joined array (the owner-edits diff stringifies
 * `photos`/`gallery_images` arrays). A reviewer approving photos needs to SEE
 * them, not read storage URLs, so anything that looks like an image renders
 * as a clickable thumbnail opening full-size in a new tab.
 *
 * Detection is by extension (query strings and signed-URL tokens allowed);
 * anything unrecognised falls back to the raw text unchanged.
 */

const IMAGE_RE = /\.(jpe?g|png|webp|gif|heic|avif)([?#]|$)/i;

export function isImageUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim()) && IMAGE_RE.test(value.trim());
}

/** Split a maybe-comma-joined value; returns null unless EVERY part is an image URL. */
export function asImageUrls(value: unknown): string[] | null {
  if (Array.isArray(value)) {
    const items = value.filter((v): v is string => typeof v === 'string');
    return items.length > 0 && items.every(isImageUrl) ? items : null;
  }
  if (typeof value !== 'string' || !value.trim()) return null;
  const parts = value.split(',').map(p => p.trim()).filter(Boolean);
  return parts.length > 0 && parts.every(isImageUrl) ? parts : null;
}

export function AdminThumbs({ urls }: { urls: string[] }) {
  return (
    <span className="admin-thumbs">
      {urls.map(url => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="admin-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Submitted photo" loading="lazy" />
        </a>
      ))}
    </span>
  );
}

/** A submitted value: image URL(s) become thumbnails, anything else is text. */
export function AdminValue({ value }: { value: string }) {
  const urls = asImageUrls(value);
  if (urls) return <AdminThumbs urls={urls} />;
  return <>{value}</>;
}
