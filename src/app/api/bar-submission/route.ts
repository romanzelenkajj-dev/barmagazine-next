import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role key (bypasses RLS)
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = serviceKey
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey)
  : null;

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.city || !data.country || !data.email) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert into Supabase using service role key
    if (!supabaseAdmin) {
      console.error('SUPABASE_SERVICE_ROLE_KEY not configured');
      // Fallback: log the submission — it will be visible in Vercel logs
      console.log('BAR_SUBMISSION:', JSON.stringify(data));
      return NextResponse.json({ success: true, note: 'Submission logged, database save pending env setup' });
    }

    const { data: submission, error } = await supabaseAdmin
      .from('bar_submissions')
      .insert({
        name: data.name,
        city: data.city,
        country: data.country,
        address: data.address || null,
        type: data.type || 'Cocktail Bar',
        website: data.website || null,
        instagram: data.instagram || null,
        email: data.email,
        phone: data.phone || null,
        description: data.description || null,
        contact_name: data.contact_name || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    console.log('New bar submission saved:', submission.id);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (e) {
    console.error('Bar submission error:', e);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
