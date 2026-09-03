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
 * Falls back to the ORIGINAL file on any failure (odd formats, canvas
 * unavailable) — the caller's size check then produces the clear
 * "email it to us" message instead of a platform 413.
 */
export async function downscaleImage(file: File): Promise<Blob> {
  try {
    // Small enough already: don't recompress what doesn't need it.
    if (file.size <= 500_000) return file;

    const img = await loadImage(file);
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
