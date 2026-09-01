import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser client. `detectSessionInUrl` is OFF on purpose: it would turn
 * fragment tokens into a session during page load, and the scanner-safe rule
 * is that NOTHING creates a session on load — every emailed link carries a
 * `token_hash` that the landing pages exchange via verifyOtp in a click
 * handler instead.
 *
 * SINGLETON, not per-call: every call site (auth callback, authHeader on each
 * API request, signOut) used to get its own GoTrueClient, all sharing one
 * storage key. The instances race — GoTrue's own console warning — and a
 * stale one could hand out an outdated token or clobber a fresh session,
 * which is how finishing a claim sometimes bounced a signed-in owner back to
 * the login page.
 */
let browserClient: ReturnType<typeof createClient> | null = null;

export function createBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    });
  }
  return browserClient;
}

/**
 * Every supabase-js query is a fetch() under the hood, and Next.js caches
 * fetches made inside GET route handlers in its Data Cache. That turned
 * reads into time bombs: verifyOwnerToken's profile lookup in /api/owner/bars
 * cached its first EMPTY result per user, so every later request replayed
 * "no profile", hit the duplicate-key insert, and 401'd a valid session on
 * every lambda, forever. no-store opts every Supabase request out.
 */
export const noStoreFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: 'no-store' });

/** Server-side admin client (service role key, bypasses RLS). */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey, { global: { fetch: noStoreFetch } });
}

/**
 * Resolve a request's owner from a Supabase access token.
 *
 * Callers pass the bearer token from `Authorization`. Supabase verifies it —
 * signature, expiry and revocation are its job, not ours. The previous
 * implementation hand-verified a JWT signed with a local `JWT_SECRET` that
 * fell back to the literal string 'fallback-secret' when unset, so anyone who
 * knew that default could mint a token for any ownerId.
 *
 * `bar_owners` is a profile table whose id IS the auth user id, so the row is
 * created here on first sign-in. Magic links have no signup step to create it
 * in: the first time someone follows a link they exist in `auth.users` but not
 * yet in `bar_owners`.
 *
 * Returns null on any failure, so routes keep answering 401 rather than
 * distinguishing "bad token" from "no profile".
 */
export async function verifyOwnerToken(token: string): Promise<OwnerProfile | null> {
  if (!token) return null;

  try {
    const supabase = createAdminClient();

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    const user = userData?.user;
    if (userError || !user?.id || !user.email) {
      // 401s from this path were untraceable in production; name the reason.
      console.warn(
        '[verifyOwnerToken] getUser failed:',
        userError ? `${userError.status ?? '?'} ${userError.message}` : 'no user/email in response'
      );
      return null;
    }

    const { data: existing } = await supabase
      .from('bar_owners')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (existing) return existing as OwnerProfile;

    // First sign-in: create the profile. name/role come from whatever the
    // claim flow put in user_metadata; both are nullable.
    const { data: created, error: insertError } = await supabase
      .from('bar_owners')
      .insert({
        id: user.id,
        email: user.email,
        name:
          (user.user_metadata?.full_name as string) ||
          (user.user_metadata?.name as string) ||
          null,
        role: (user.user_metadata?.role as string) || null,
      })
      .select()
      .single();

    if (insertError) {
      // A concurrent first request may have won the race; re-read before failing.
      const { data: raced } = await supabase
        .from('bar_owners')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (!raced) {
        console.warn('[verifyOwnerToken] profile insert failed and re-read empty:', insertError.message);
      }
      return (raced as OwnerProfile) ?? null;
    }

    return created as OwnerProfile;
  } catch (e) {
    console.warn('[verifyOwnerToken] threw:', e instanceof Error ? e.message : e);
    return null;
  }
}

// ---------- Types ----------

/** Mirrors `public.bar_owners` after the auth migration: id FKs auth.users(id). */
export interface OwnerProfile {
  id: string;
  email: string;
  name: string | null;
  role: string | null;
  created_at: string;
  updated_at: string;
}

export interface BarSubmissionRow {
  id: string;
  name: string;
  city: string;
  country: string;
  address: string | null;
  type: string;
  website: string | null;
  instagram: string | null;
  email: string;
  phone: string | null;
  description: string | null;
  contact_name: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  notes: string | null;
  owner_id: string | null;
  photo_url: string | null;
}
