import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error('Service role key not configured');
  }
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);
}

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-admin-secret');
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { action, barId, barName, updates } = body;
  const supabase = getServiceClient();

  if (action === 'delete') {
    const query = barName
      ? supabase.from('bars').delete().eq('name', barName).select()
      : supabase.from('bars').delete().eq('id', barId).select();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ deleted: data });
  }

  if (action === 'update') {
    const query = barName
      ? supabase.from('bars').update(updates).eq('name', barName).select()
      : supabase.from('bars').update(updates).eq('id', barId).select();
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
