/**
 * Outbound mail: one sender identity, one place that logs failures.
 *
 * Bar owners reply to these messages, so the From/Reply-To must land in a real
 * mailbox — `onboarding@resend.dev` (Resend's sandbox sender) both looks
 * untrustworthy and can only deliver to the account owner's own address.
 * barmagazine.com is verified, so we send as ourselves.
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY || '';

/** Overridable per environment; the defaults are the real mailboxes. */
export const MAIL_FROM = process.env.MAIL_FROM || 'BarMagazine <hello@barmagazine.com>';
export const MAIL_REPLY_TO = process.env.MAIL_REPLY_TO || 'office@barmagazine.com';

export interface SendMailArgs {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  /** Short tag for the log line, e.g. 'claim-link'. */
  context?: string;
}

/**
 * Send one email. Never throws — a mail failure must not fail the request that
 * triggered it, since the underlying record is already stored.
 *
 * But it is never silent either. A 403 swallowed on a real owner's claim link
 * is the worst failure this system has: the owner waits for mail that will
 * never arrive, and nothing anywhere says so. Every failure logs the
 * recipient, the HTTP status and the provider's message.
 */
export async function sendMail(args: SendMailArgs): Promise<boolean> {
  const { to, subject, html, from = MAIL_FROM, replyTo = MAIL_REPLY_TO, context = 'mail' } = args;
  const recipients = Array.isArray(to) ? to : [to];
  const who = recipients.join(', ');

  if (!RESEND_API_KEY) {
    console.error(`[${context}] NOT SENT to ${who} — RESEND_API_KEY unset`);
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
        from,
        to: recipients,
        reply_to: replyTo,
        subject,
        html,
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => '<unreadable>');
      console.error(
        `[${context}] SEND FAILED to ${who} — status ${res.status} ${res.statusText}: ${detail}`
      );
      return false;
    }

    console.log(`[${context}] sent to ${who}`);
    return true;
  } catch (e) {
    console.error(`[${context}] SEND THREW for ${who}:`, e);
    return false;
  }
}
