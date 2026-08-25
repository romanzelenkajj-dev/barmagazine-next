import { sendMail } from './mail';
/**
 * Admin notifications for things that land in a review queue.
 *
 * A queue only protects the site if someone sees it — owner edits sit in
 * `owner_submissions` with no UI surfacing them, so without this an edit could
 * wait indefinitely. Sends are best-effort: a notification failure must never
 * fail the owner's request, since their submission is already stored.
 */

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

/** Admin notifications go to the notification mailbox, sent as BarMagazine. */
async function send({ subject, html }: { subject: string; html: string }): Promise<boolean> {
  const to = process.env.NOTIFICATION_EMAIL || '';
  if (!to) {
    console.error('[notify] NOT SENT — NOTIFICATION_EMAIL unset');
    return false;
  }
  return sendMail({ to, subject, html, context: 'notify' });
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
          Nothing is live until you approve it.
          <a href="${SITE_URL}/admin/review?tab=edits">Review this edit</a>
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

  // A transfer is the one that can take a listing away from an existing owner,
  // so it must not look like the routine case at a glance.
  const banner = isTransfer
    ? `<p style="padding:14px 16px;background:#721c24;color:#fff;font-size:15px;font-weight:700;border-radius:6px;">
         ⚠ TRANSFER — ${escapeHtml(barName)} already has an owner.<br>
         <span style="font-weight:400;">Nothing happens until you approve it. Approving moves the listing to the new claimant.</span>
       </p>`
    : needsReview
      ? `<p style="padding:10px 12px;background:#fff3cd;color:#856404;font-size:14px;border-radius:6px;">
           Waiting on your review — no access has been granted.
         </p>`
      : `<p style="padding:10px 12px;background:#d4edda;color:#155724;font-size:14px;border-radius:6px;">
           Auto-verifiable: a confirmation link was sent to the address on file.
           The claimant becomes the owner when they follow it.
         </p>`;

  return send({
    subject: `${isTransfer ? 'Bar TRANSFER' : 'Bar claim'}: ${barName}${needsReview ? ' (needs review)' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2 style="color:#1A1A1A;">${isTransfer ? 'Ownership transfer requested' : 'New bar claim'}</h2>
        <p style="font-size:16px;margin:0 0 14px;">${barLink}</p>
        ${banner}
        <table style="width:100%;border-collapse:collapse;font-size:15px;">
          ${fieldRows({
            Route: METHOD_LABEL[method],
            Claimant: claimantEmail,
            Name: claimantName || '—',
            Role: claimantRole || '—',
            ...(proofCount != null ? { Proof: `${proofCount} file${proofCount === 1 ? '' : 's'}` } : {}),
          })}
        </table>
        <p style="margin-top:24px;font-size:13px;color:#999;">Review at ${SITE_URL}/admin/review?tab=claims</p>
      </div>
    `,
  });
}
