'use client';

import { createBrowserClient } from './supabase-auth';

/**
 * Browser-side session helpers for the owner dashboard.
 *
 * The dashboard used to keep a hand-minted JWT in `localStorage` under
 * `owner_token`. Sessions now belong to supabase-js, which persists and
 * refreshes them itself — so pages ask for the current access token at call
 * time instead of reading a token that may have expired hours ago.
 */

/** Current access token, or null when signed out. */
export async function getAccessToken(): Promise<string | null> {
  const supabase = createBrowserClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

/** Authorization header for the owner API, or null when signed out. */
export async function authHeader(): Promise<{ Authorization: string } | null> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : null;
}

/** Sign out and clear the persisted session. */
export async function signOut(): Promise<void> {
  const supabase = createBrowserClient();
  await supabase.auth.signOut();
  // Left over from the previous auth; remove so a stale value can't linger.
  try {
    localStorage.removeItem('owner_token');
  } catch {
    /* private mode / storage disabled */
  }
}
