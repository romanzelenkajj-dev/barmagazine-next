import { createClient } from '@supabase/supabase-js';
import { jwtVerify } from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser-side Supabase client with auth persistence
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
}

// Server-side admin client (service role key, bypasses RLS)
export function createAdminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

// Verify owner JWT token and return owner profile
export async function verifyOwnerToken(token: string): Promise<OwnerProfile | null> {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    const ownerId = payload.ownerId as string;
    if (!ownerId) return null;

    const supabase = createAdminClient();
    const { data } = await supabase
      .from('bar_owners')
      .select('*')
      .eq('id', ownerId)
      .single();

    return data as OwnerProfile | null;
  } catch {
    return null;
  }
}

// ---------- Types ----------

export interface OwnerProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
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
