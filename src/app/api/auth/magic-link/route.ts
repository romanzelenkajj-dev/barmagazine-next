import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { sendLoginLinkEmail } from '@/lib/claim-email';

// Sends mail per request — never prerender or cache.
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://barmagazine.com';

/**
 * Request a sign-in link for the owner dashboard.
 *
 * Minted with admin.generateLink and mailed by us (branded sender, not
 * Supabase's stock template) as a SCANNER-SAFE link: the URL carries only
 * `token_hash`, and the landing page exchanges it via verifyOtp in a click
 * handler — a mail scanner following the link consumes nothing.
 *
 * No self-registration: generateLink fails for an address with no account
 * (accounts exist only because a bar was claimed) and nothing is sent. The
 * response is deliberately identical whether or not the address has an
 * account: this endpoint is unauthenticated, so distinguishing them would
 * turn it into an account-enumeration oracle.
 */
export async function POST(request: NextRequest) {
  const generic = NextResponse.json({
    success: true,
    message: 'If that address can access a bar, a sign-in link is on its way.',
  });

  try {
    const { email } = await request.json();

    if (typeof email !== 'string' || !email.includes('@') || email.length > 320) {
      return NextResponse.json({ error: 'A valid email address is required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Failure (unknown address, mint error, send error) is logged inside and
    // never surfaced — the caller always sees the same response.
    await sendLoginLinkEmail(supabase, {
      destination: email.trim().toLowerCase(),
      redirectTo: `${SITE_URL}/owner-dashboard/auth/callback`,
    });

    return generic;
  } catch {
    return generic;
  }
}
