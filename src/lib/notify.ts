/**
 * Admin notifications for things that land in a review queue.
 *
 * A queue only protects the site if someone sees it — owner edits sit in
 * `owner_submissions` with no UI surfacing them, so without this an edit could
 * wait indefinitely. Sends are best-effort: a notification failure must never
 * fail the owner's request, since their submission is already stored.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL || '';
const SITE_URL = 'https://barmagazine.com';

/**
 * Escape before interpolating into the email body. Values here are
 * owner-supplied (bar names, URLs, opening hours), so unescaped `<` would let
 * a submission inject markup into the admin's inbox.
 */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Render a submitted-fields object as table rows, truncating long values. */
export function fieldRows(fields: Record<string, unknown>): string {
  return Object.entries(fields)
    .map(([key, value], i) => {
      const rendered = Array.isArray(value)
        ? `${value.length} item${value.length === 1 ? '' : 's'}`
        : typeof value === 'object' && value !== null
          ? JSON.stringify(value).slice(0, 200)
          : String(value ?? '');
      const shown = rendered.length > 200 ? `${rendered.slice(0, 200)}…` : rendered;
      const bg = i % 2 === 1 ? ' style="background:#f9f9f9;"' : '';
      return `<tr${bg}><td style="padding:8px 12px;font-weight:600;color:#666;width:160px;">${escapeHtml(
        key
      )}</td><td style="padding:8px 12px;">${escapeHtml(shown)}</td></tr>`;
    })
    .join('');
}

interface SendArgs {
  subject: string;
  html: string;
}

async function send({ subject, html }: SendArgs): Promise<boolean> {
  if (!RESEND_API_KEY || !NOTIFICATION_EMAIL) {
    // Local dev and preview builds routinely lack these; not an error.
    console.log('[notify] skipped, RESEND_API_KEY or NOTIFICATION_EMAIL unset');
    return false;
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'BarMagazine <onboarding@resend.dev>',
        to: [NOTIFICATION_EMAIL],
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error('[notify] resend error:', await res.text());
      return false;
    }
    return true;
  } catch (e) {
    console.error('[notify] send failed:', e);
    return false;
  }
}

export interface OwnerSubmissionNotice {
  barName: string;
  barSlug?: string | null;
  ownerEmail: string;
  submissionType: string;
  fields: Record<string, unknown>;
  /** Keys the allowlist dropped, worth seeing — repeated attempts are a signal. */
  rejected?: string[];
}

/** Email the admin that an owner edit is waiting in the review queue. */
export async function notifyOwnerSubmission(notice: OwnerSubmissionNotice): Promise<boolean> {
  const { barName, barSlug, ownerEmail, submissionType, fields, rejected = [] } = notice;

  const label = submissionType === 'photo_upload' ? 'Photo upload' : 'Info update';
  const barLink = barSlug
    ? `<a href="${SITE_URL}/bars/${escapeHtml(barSlug)}">${escapeHtml(barName)}</a>`
    : escapeHtml(barName);

  const rejectedBlock = rejected.length
    ? `<p style="margin-top:16px;padding:10px 12px;background:#fff3cd;color:#856404;font-size:13px;">
         Dropped by the field allowlist: ${escapeHtml(rejected.join(', '))}
       </p>`
    : '';

  return send({
    subject: `Owner edit pending: ${barName} (${label})`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A1A1A;">Owner edit awaiting review</h2>
        <p style="font-size:15px;color:#444;">
          ${barLink} — submitted by ${escapeHtml(ownerEmail)}
        </p>
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${fieldRows(fields)}
        </table>
        ${rejectedBlock}
        <p style="margin-top:24px;font-size:13px;color:#999;">
          Nothing is live until you approve it. Review at ${SITE_URL}/admin/submissions
        </p>
      </div>
    `,
  });
}
