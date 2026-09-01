import type { createAdminClient } from './supabase-auth';
import { escapeHtml } from './notify';
import { sendMail } from './mail';

/**
 * The claim and sign-in emails.
 *
 * Supabase's stock template sends from `noreply@mail.app.supabase.io` with no
 * BarMagazine branding — which reads as phishing to a bar owner who only ever
 * dealt with BarMagazine. So we mint the token with `admin.generateLink` and
 * post it ourselves through Resend, on the same verified sender as the rest
 * of our mail.
 *
 * SCANNER-SAFE: we deliberately do NOT send Supabase's `action_link` — that
 * URL redeems the token server-side on GET, so a corporate mail scanner that
 * prefetches links consumes the token and (in the old flow) completed the
 * sign-in without a human. We send our own landing-page URL carrying only
 * `token_hash`; the page does nothing on load, and the token is exchanged via
 * `verifyOtp` in a click handler.
 *
 * Link lifetime is unchanged: generateLink issues the same token
 * signInWithOtp would have, honouring the project's OTP expiry setting.
 */

export interface ClaimLinkEmail {
  destination: string;
  barName: string;
  actionLink: string;
}

/**
 * COPY — supplied by Roman, kept in one place so it can be edited without
 * touching the sending logic. `barName` appears in both subject and body.
 */
export function claimEmailSubject(barName: string): string {
  return `Confirm you manage ${barName} on BarMagazine`;
}

export function claimEmailHtml({ barName, actionLink }: Omit<ClaimLinkEmail, 'destination'>): string {
  const bar = escapeHtml(barName);
  const href = escapeHtml(actionLink);
  return `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;font-size:15px;line-height:1.6;">
      <p>
        You asked to claim <strong>${bar}</strong> on BarMagazine, the global
        cocktail bar directory.
      </p>
      <p>
        Confirm below to verify your email address and take over the listing.
        The button opens a page where you confirm with one click.
      </p>
      <p style="margin:28px 0;">
        <a href="${href}"
           style="background:#1A1A1A;color:#fff;padding:12px 22px;border-radius:100px;text-decoration:none;font-weight:600;display:inline-block;">
          Confirm and claim ${bar}
        </a>
      </p>
      <p>
        Once confirmed you can keep your opening hours, contact details, menu and
        photos up to date. It&rsquo;s free, and there&rsquo;s nothing to pay or sign up for.
      </p>
      <p style="color:#6B6B6B;">
        If you weren&rsquo;t expecting this email, just ignore it. Nothing changes and
        nobody gets access to your listing.
      </p>
      <p style="color:#6B6B6B;">
        This link expires in 24 hours. If it has expired, just start the claim
        again from your bar&rsquo;s page and we&rsquo;ll send you a fresh one.
      </p>
      <p style="color:#9A9A9A;margin-top:28px;">— BarMagazine · barmagazine.com</p>
    </div>
  `;
}

/**
 * Mint a magic link for `destination` and mail it ourselves.
 *
 * Returns false if the link could not be minted or sent — the caller must not
 * change its response either way, since claim-start answers identically
 * regardless of outcome.
 */
export async function sendClaimLinkEmail(
  supabase: ReturnType<typeof createAdminClient>,
  opts: { destination: string; barName: string; redirectTo: string }
): Promise<boolean> {
  const { destination, barName, redirectTo } = opts;

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: destination,
    });

    // hashed_token, NOT action_link: the action link redeems on GET at
    // Supabase's /verify endpoint, which is what a mail scanner follows.
    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      console.error(
        `[claim-link] LINK NOT MINTED for ${destination} — ${error?.message || 'no hashed_token returned'}`
      );
      return false;
    }

    const joiner = redirectTo.includes('?') ? '&' : '?';
    const actionLink = `${redirectTo}${joiner}token_hash=${encodeURIComponent(tokenHash)}`;

    return sendMail({
      to: destination,
      subject: claimEmailSubject(barName),
      html: claimEmailHtml({ barName, actionLink }),
      context: 'claim-link',
    });
  } catch (e) {
    console.error('[claim-email] SEND THREW for', destination, e);
    return false;
  }
}

/**
 * The owner-dashboard sign-in email — same scanner-safe token_hash pattern,
 * same branded sender. Returns false when the address has no account
 * (generateLink errors), which the caller must not surface: the login
 * endpoint answers identically either way to stay enumeration-proof.
 */
export async function sendLoginLinkEmail(
  supabase: ReturnType<typeof createAdminClient>,
  opts: { destination: string; redirectTo: string }
): Promise<boolean> {
  const { destination, redirectTo } = opts;

  try {
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: destination,
    });

    const tokenHash = data?.properties?.hashed_token;
    if (error || !tokenHash) {
      // Unknown address is the expected failure — do not log the address.
      if (error && !/not.?found|does not exist/i.test(error.message)) {
        console.warn('[login-link] mint failed:', error.message);
      }
      return false;
    }

    const joiner = redirectTo.includes('?') ? '&' : '?';
    const link = `${redirectTo}${joiner}token_hash=${encodeURIComponent(tokenHash)}`;

    return sendMail({
      to: destination,
      subject: 'Your BarMagazine owner dashboard sign-in link',
      html: `
        <div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1A1A1A;font-size:15px;line-height:1.6;">
          <p>You asked to sign in to your BarMagazine owner dashboard.</p>
          <p style="margin:28px 0;">
            <a href="${escapeHtml(link)}"
               style="background:#1A1A1A;color:#fff;padding:12px 22px;border-radius:100px;text-decoration:none;font-weight:600;display:inline-block;">
              Open my dashboard
            </a>
          </p>
          <p>The button opens a page where you confirm the sign-in with one click.</p>
          <p style="color:#6B6B6B;">
            If you didn&rsquo;t request this, ignore it — nothing happens without the click.
          </p>
          <p style="color:#9A9A9A;margin-top:28px;">&mdash; BarMagazine &middot; barmagazine.com</p>
        </div>
      `,
      context: 'login-link',
    });
  } catch (e) {
    console.error('[login-link] SEND THREW', e);
    return false;
  }
}
