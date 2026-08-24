import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Sends mail per request — never prerender or cache.
export const dynamic = 'force-dynamic';

const SITE_URL = 'https://barmagazine.com';

/**
 * Request a magic link for the owner dashboard.
 *
 * Replaces the password login/signup pair. Link expiry is a Supabase project
 * setting, not a value we pass here.
 *
 * The response is deliberately identical whether or not the address has an
 * account: this endpoint is unauthenticated, so distinguishing them would turn
 * it into an account-enumeration oracle. Same reasoning as the claim-start
 * rate limit in the spec.
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

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('[magic-link] Supabase env not configured');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: `${SITE_URL}/owner-dashboard/auth/callback`,
        // Owners reach the dashboard by claiming a bar, not by self-registering
        // here. Supabase would otherwise create an account for any address typed
        // into this box.
        shouldCreateUser: false,
      },
    });

    // Logged, not surfaced — the caller always sees the same response.
    if (error) console.warn('[magic-link] send failed:', error.message);

    return generic;
  } catch {
    return generic;
  }
}
