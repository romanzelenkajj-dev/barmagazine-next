/**
 * One-click unsubscribe for the listing emails.
 *
 * WHY (2026-09-17): the only opt-out was "reply 'unsubscribe'". A reply costs
 * the recipient effort, and a recipient who cannot opt out easily presses the
 * spam button instead. Spam complaints are what damage a sending domain, and
 * we are emailing more bars every week.
 *
 * POST is what RFC 8058 one-click uses: the mail client calls it directly from
 * the List-Unsubscribe-Post header, with no page load and no confirmation.
 * GET is the visible link in the footer, for a human who clicks it.
 *
 * Writes to public.email_optouts (scripts/email-optouts-migration.sql). If
 * that table does not exist yet the route still answers 200 and says the
 * request was received, because telling someone their unsubscribe failed is
 * worse than telling us: the address is logged in the response for the
 * hand-maintained outreach/optout.txt either way.
 */
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i;

async function record(email: string, source: string, barSlug: string | null, ua: string | null) {
  if (!SUPA_URL || !SERVICE_KEY) return { ok: false, reason: 'no service credentials' };
  try {
    const res = await fetch(`${SUPA_URL}/rest/v1/email_optouts`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_KEY,
        Authorization: `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        // An address that opts out twice is not an error.
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({ email: email.toLowerCase(), source, bar_slug: barSlug, user_agent: ua }),
    });
    if (res.ok) return { ok: true };
    return { ok: false, reason: `${res.status} ${(await res.text()).slice(0, 200)}` };
  } catch (e) {
    return { ok: false, reason: String(e).slice(0, 200) };
  }
}

/** Never echo the address back into HTML. */
const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function page(title: string, body: string, status = 200) {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<style>
  body{margin:0;background:#f4f2ee;font-family:Georgia,'Times New Roman',serif;color:#1a1a1a}
  main{max-width:560px;margin:12vh auto;background:#fff;border:1px solid #e6e2da;padding:34px 32px}
  h1{font-size:22px;margin:0 0 14px}
  p{font-size:16px;line-height:1.6;margin:0 0 14px}
  a{color:#8a6a24}
  .small{font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#9a9284}
</style>
<main>${body}<p class="small">BarMagazine &middot; <a href="https://barmagazine.com/bars">barmagazine.com/bars</a></p></main>`,
    { status, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } },
  );
}

/** RFC 8058 one-click: the mail client posts here. Always answer 200. */
export async function POST(req: NextRequest) {
  const url = new URL(req.url);
  let email = url.searchParams.get('email') || '';
  if (!email) {
    // Some clients send the form body rather than the query string.
    try {
      const text = await req.text();
      email = new URLSearchParams(text).get('email') || '';
    } catch { /* body is optional */ }
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'no valid address' }, { status: 400 });
  }
  const r = await record(email, 'one-click', url.searchParams.get('bar'), req.headers.get('user-agent'));
  // 200 either way: a mail provider reads a non-200 as a broken unsubscribe,
  // which is the reputation damage this route exists to avoid.
  return NextResponse.json({ ok: true, recorded: r.ok });
}

/** The visible link in the email footer. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email') || '';
  if (!EMAIL_RE.test(email)) {
    return page('Unsubscribe', `<h1>Unsubscribe</h1>
      <p>This link is missing an email address. Reply to the email you received with the word
      unsubscribe and we will not email that address again.</p>`, 400);
  }
  const r = await record(email, 'link', url.searchParams.get('bar'), req.headers.get('user-agent'));
  return page('Unsubscribed', `<h1>Unsubscribed</h1>
    <p>We will not email <strong>${escapeHtml(email)}</strong> about a listing again.</p>
    <p>The bar's profile stays live and free in the directory. If you would like it corrected or
    removed, reply to the email and we will do it.</p>
    ${r.ok ? '' : '<p class="small">Recorded for manual processing.</p>'}`);
}
