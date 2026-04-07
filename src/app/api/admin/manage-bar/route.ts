import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

function getServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!serviceKey || !supabaseUrl) {
    throw new Error('Supabase URL or service role key not configured');
  }
  return createClient(supabaseUrl, serviceKey);
}

function checkAuth(request: NextRequest): boolean {
  const secret = request.headers.get('x-admin-secret');
  return secret === process.env.ADMIN_SECRET;
}

// GET — list all bars (admin view, includes inactive)
export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getServiceClient();
  // Paginate to bypass Supabase's default 1000-row limit
  const PAGE_SIZE = 1000;
  const allBars: Record<string, unknown>[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from('bars')
      .select('*')
      .order('name', { ascending: true })
      .range(from, from + PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    allBars.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return NextResponse.json({ bars: allBars });
}

// POST — update or delete a bar
export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
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
    const query = barId
      ? supabase.from('bars').update(updates).eq('id', barId).select()
      : barName
        ? supabase.from('bars').update(updates).eq('name', barName).select()
        : null;
    if (!query) return NextResponse.json({ error: 'barId or barName required' }, { status: 400 });
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ updated: data });
  }

  if (action === 'create') {
    const { data, error } = await supabase.from('bars').insert(updates).select();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ created: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
