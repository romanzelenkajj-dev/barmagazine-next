import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Browser client. `detectSessionInUrl` is what completes a magic-link sign-in:
 * the callback page loads with the tokens in the URL and supabase-js turns
 * them into a persisted session.
 */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/** Server-side admin client (service role key, bypasses RLS). */
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
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
    if (userError || !user?.id || !user.email) return null;

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
      return (raced as OwnerProfile) ?? null;
    }

    return created as OwnerProfile;
  } catch {
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
