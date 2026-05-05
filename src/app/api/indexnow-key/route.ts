import { NextResponse } from 'next/server';

/**
 * IndexNow ownership-verification endpoint.
 *
 * The IndexNow protocol requires a key file at `/{key}.txt` with the key
 * itself as the body. Search engines fetch this URL to confirm we own the
 * domain before accepting our submitted URLs.
 *
 * The actual URL is set up in next.config.mjs via a rewrite that
 * interpolates `${process.env.INDEXNOW_KEY}.txt` at build time, pointing
 * to this handler. So a request to `/05693b...11c.txt` lands here and we
 * return the key.
 *
 * If `INDEXNOW_KEY` isn't set in the deploy env, the rewrite source falls
 * back to a placeholder path that won't be hit by anyone, and this handler
 * returns an empty body. Graceful degradation — IndexNow simply doesn't
 * verify and our submissions get rejected, but nothing breaks.
 */
export async function GET() {
  const key = process.env.INDEXNOW_KEY ?? '';
  return new NextResponse(key, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
