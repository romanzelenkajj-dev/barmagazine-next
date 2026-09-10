/**
 * Client-side photo downscaling for forms that ship images inside the request
 * body (base64 in JSON, or multipart FormData).
 *
 * Why: Vercel rejects serverless request bodies over ~4.5MB with a 413
 * BEFORE the function runs — no log, no email, no row. The listing form
 * advertised "max 5MB" photos and base64 inflates by a third, so any photo
 * over ~3.3MB silently killed the submission with a generic error (this is
 * what bounced Mondrian HK's marketing team). Downscaling in the browser
 * keeps the 5MB promise honest: a 5MB phone photo becomes a few hundred KB.
 */

export const MAX_DIMENSION = 2000;
export const JPEG_QUALITY = 0.85;

/** Body budget after compression. Vercel's cap is ~4.5MB; base64 adds a
    third, so 3.2MB of blob is the safe ceiling for the JSON path and
    comfortably inside it for multipart. */
export const MAX_UPLOAD_BYTES = 3_200_000;

export const PHOTO_TOO_LARGE_MESSAGE =
  'That photo is too large to upload, even after compression. Please email it to office@barmagazine.com and we will add it for you.';

export const UNSUPPORTED_FORMAT_MESSAGE =
  'Please upload a JPG or PNG. iPhone HEIC photos are not supported by web browsers: in the Photos app, choose Share, then Options, then Most Compatible, or email the photo to office@barmagazine.com and we will convert it for you.';

/** Thrown when a file is not a browser-renderable image. Callers show
    UNSUPPORTED_FORMAT_MESSAGE instead of uploading bytes no browser can
    display (Majnoon's owner uploaded an iPhone HEIC named .jpg three
    times; the old catch-all fallback shipped it raw and every preview
    rendered broken). */
export class UnsupportedImageError extends Error {
  constructor() {
    super('unsupported image format');
    this.name = 'UnsupportedImageError';
  }
}

/** Sniff the REAL type from magic bytes - extension and file.type are
    user-controlled and were exactly what let HEIC through as .jpg. */
async function sniffImageType(file: File): Promise<'jpeg' | 'png' | 'webp' | 'gif' | 'heic' | 'unknown'> {
  const head = new Uint8Array(await file.slice(0, 16).arrayBuffer());
  const ascii = (from: number, to: number) => String.fromCharCode.apply(null, Array.from(head.slice(from, to)));
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return 'jpeg';
  if (head[0] === 0x89 && ascii(1, 4) === 'PNG') return 'png';
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp';
  if (ascii(0, 4) === 'GIF8') return 'gif';
  if (ascii(4, 8) === 'ftyp') {
    const brand = ascii(8, 12);
    if (['heic', 'heix', 'hevc', 'heif', 'mif1', 'msf1', 'avif'].includes(brand)) return 'heic';
  }
  return 'unknown';
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('image failed to load'));
    };
    img.src = url;
  });
}

/**
 * Downscale to at most MAX_DIMENSION on the long edge, re-encoded as JPEG.
 *
 * Throws UnsupportedImageError for files that are not browser-renderable
 * images (HEIC, or anything whose magic bytes we cannot identify AND the
 * browser cannot decode). The old behavior fell back to the ORIGINAL file
 * on ANY failure, which shipped undecodable HEIC bytes straight to storage.
 * The original-file fallback now applies only after a SUCCESSFUL decode
 * (canvas quirks, recompression not shrinking) - those bytes are proven
 * renderable.
 */
export async function downscaleImage(file: File): Promise<Blob> {
  const kind = await sniffImageType(file);
  if (kind === 'heic') throw new UnsupportedImageError();

  let img: HTMLImageElement;
  try {
    img = await loadImage(file);
  } catch {
    // Known-good magic bytes that still refuse to decode are a corrupt
    // file; unknown ones are an unsupported format. Same answer either
    // way: don't upload what no browser can show.
    throw new UnsupportedImageError();
  }

  try {
    // Small enough already: don't recompress what doesn't need it. Decode
    // proved it renderable first - the old early-return let small HEICs
    // skip the check entirely.
    if (file.size <= 500_000) return file;

    const long = Math.max(img.naturalWidth, img.naturalHeight);
    if (!long) return file;
    const scale = Math.min(1, MAX_DIMENSION / long);

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY)
    );
    // Recompression is only a win when it actually shrinks the payload.
    return blob && blob.size < file.size ? blob : file;
  } catch {
    return file;
  }
}

/** The downscaled blob as a data URL, for the JSON submission path. */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
