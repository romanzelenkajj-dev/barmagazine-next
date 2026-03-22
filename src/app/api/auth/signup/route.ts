import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) return null;
  return createClient(supabaseUrl, serviceKey);
}

export async function POST(request: Request) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: full_name || '', role: 'owner' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // Create owner profile
    const { error: profileError } = await supabase
      .from('owner_profiles')
      .insert({
        user_id: authData.user.id,
        email,
        full_name: full_name || null,
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json({ success: true, userId: authData.user.id });
  } catch (e) {
    console.error('Signup error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
