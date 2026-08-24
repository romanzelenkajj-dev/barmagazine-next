import type { createAdminClient } from './supabase-auth';
import { escapeHtml } from './notify';
import { sendMail } from './mail';

/**
 * The claim sign-in email.
 *
 * Supabase's stock template sends from `noreply@mail.app.supabase.io` with no
 * BarMagazine branding, no bar name, and a line about signing up for "an
 * application powered by Supabase" — which reads as phishing to a bar owner who
 * only ever dealt with BarMagazine. So we mint the action link with
 * `admin.generateLink` and post it ourselves through Resend, on the same
 * verified sender as the rest of our mail.
 *
 * Link lifetime is unchanged: generateLink issues the same token
 * signInWithOtp would have, honouring the project's OTP expiry setting.
 * Sending it ourselves also takes the flow off Supabase's mail rate limits.
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
        Someone asked to claim <strong>${bar}</strong> on BarMagazine, the global
        cocktail bar directory.
      </p>
      <p>
        We sent this to the contact address listed on the bar&rsquo;s profile — so if
        that was you, confirm below and the listing is yours.
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
      <p style="color:#6B6B6B;">This link expires in 30 minutes.</p>
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
      options: { redirectTo },
    });

    const actionLink = data?.properties?.action_link;
    if (error || !actionLink) {
      console.error(
        `[claim-link] LINK NOT MINTED for ${destination} — ${error?.message || 'no action_link returned'}`
      );
      return false;
    }

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
