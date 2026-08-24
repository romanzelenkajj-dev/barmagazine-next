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

export interface ClaimNotice {
  barName: string;
  barSlug?: string | null;
  claimantEmail: string;
  claimantName?: string | null;
  claimantRole?: string | null;
  method: 'domain_match' | 'contact_on_file' | 'manual';
  isTransfer: boolean;
  /** True when nothing happens until Roman acts. */
  needsReview: boolean;
  proofCount?: number;
}

const METHOD_LABEL: Record<ClaimNotice['method'], string> = {
  domain_match: 'A · domain match (auto)',
  contact_on_file: 'B · contact on file (auto)',
  manual: 'C · manual review',
};

/**
 * Email the admin about a claim. Sent for every claim, not just manual ones:
 * an auto-approved claim hands someone edit rights over a listing, which is
 * worth seeing even when no action is required.
 */
export async function notifyClaim(notice: ClaimNotice): Promise<boolean> {
  const {
    barName, barSlug, claimantEmail, claimantName, claimantRole,
    method, isTransfer, needsReview, proofCount,
  } = notice;

  const barLink = barSlug
    ? `<a href="${SITE_URL}/bars/${escapeHtml(barSlug)}">${escapeHtml(barName)}</a>`
    : escapeHtml(barName);

  const banner = isTransfer
    ? `<p style="padding:10px 12px;background:#f8d7da;color:#721c24;font-size:14px;font-weight:600;">
         TRANSFER — this bar already has an owner. Always needs review.
       </p>`
    : needsReview
      ? `<p style="padding:10px 12px;background:#fff3cd;color:#856404;font-size:14px;">
           Waiting on your review — nothing has been granted.
         </p>`
      : `<p style="padding:10px 12px;background:#d4edda;color:#155724;font-size:14px;">
           Auto-verifiable: a sign-in link was sent. Ownership transfers when they click it.
         </p>`;

  return send({
    subject: `${isTransfer ? 'Bar TRANSFER' : 'Bar claim'}: ${barName}${needsReview ? ' (needs review)' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A1A1A;">${isTransfer ? 'Ownership transfer requested' : 'New bar claim'}</h2>
        ${banner}
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${fieldRows({
            Bar: barName,
            Route: METHOD_LABEL[method],
            Claimant: claimantEmail,
            Name: claimantName || '—',
            Role: claimantRole || '—',
            ...(proofCount != null ? { Proof: `${proofCount} file${proofCount === 1 ? '' : 's'}` } : {}),
          })}
        </table>
        <p style="margin-top:16px;font-size:15px;">${barLink}</p>
        <p style="margin-top:24px;font-size:13px;color:#999;">Review at ${SITE_URL}/admin/submissions</p>
      </div>
    `,
  });
}
