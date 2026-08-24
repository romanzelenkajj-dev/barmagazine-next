import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase-auth';
import { notifyClaim } from '@/lib/notify';

export const dynamic = 'force-dynamic';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'application/pdf',
]);

/**
 * Attach proof to a manual (route C) claim.
 *
 * No account is created and no link is sent here — a manual claim is unproven
 * by definition, so anything that granted access would make claim-start an
 * open account-creation endpoint pointable at any address. Roman approves in
 * the admin queue, and only that approval mints the owner.
 *
 * Uploads go to the private `claim-proof` bucket: business registrations and
 * ID-bearing documents must not be world-readable, which the public
 * `bar-photos` bucket would make them.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const claimId = String(formData.get('claim_id') || '');
    const note = String(formData.get('note') || '').slice(0, 2000);
    const files = formData.getAll('proof').filter((f): f is File => f instanceof File);

    if (!claimId) {
      return NextResponse.json({ error: 'claim_id required' }, { status: 400 });
    }
    if (files.length === 0) {
      return NextResponse.json({ error: 'At least one proof file is required' }, { status: 400 });
    }

    for (const file of files) {
      if (file.size > MAX_BYTES) {
        return NextResponse.json({ error: 'Each file must be under 10MB' }, { status: 400 });
      }
      if (!ALLOWED_TYPES.has(file.type)) {
        return NextResponse.json(
          { error: 'Proof must be a JPG, PNG, WebP, HEIC or PDF' },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();

    const { data: claim } = await supabase
      .from('bar_claims')
      .select('id, bar_id, claimant_email, claimant_name, claimant_role, status, method, is_transfer, evidence')
      .eq('id', claimId)
      .maybeSingle();

    // Only an open manual claim accepts proof. Not found and wrong-state look
    // the same to the caller, since claim ids are handed out by claim-start.
    if (!claim || claim.status !== 'pending_review') {
      return NextResponse.json({ error: 'This claim is not open for proof' }, { status: 404 });
    }

    const uploaded: string[] = [];
    for (const file of files) {
      const ext = (file.name.split('.').pop() || 'bin').toLowerCase().replace(/[^a-z0-9]/g, '');
      const path = `${claimId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('claim-proof')
        .upload(path, Buffer.from(await file.arrayBuffer()), { contentType: file.type });
      if (uploadError) {
        console.error('[claim/manual] upload failed:', uploadError.message);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
      // Store the path, not a URL — the bucket is private, so the admin queue
      // mints a short-lived signed URL when Roman actually looks.
      uploaded.push(path);
    }

    const evidence =
      claim.evidence && typeof claim.evidence === 'object' && !Array.isArray(claim.evidence)
        ? (claim.evidence as Record<string, unknown>)
        : {};

    await supabase
      .from('bar_claims')
      .update({
        evidence: {
          ...evidence,
          note: note || null,
          proof_paths: [...((evidence.proof_paths as string[]) || []), ...uploaded],
          proof_submitted_at: new Date().toISOString(),
        },
      })
      .eq('id', claim.id);

    const { data: bar } = await supabase
      .from('bars')
      .select('name, slug')
      .eq('id', claim.bar_id)
      .maybeSingle();

    await notifyClaim({
      barName: String(bar?.name ?? 'Unknown bar'),
      barSlug: bar?.slug ? String(bar.slug) : null,
      claimantEmail: String(claim.claimant_email),
      claimantName: claim.claimant_name ? String(claim.claimant_name) : null,
      claimantRole: claim.claimant_role ? String(claim.claimant_role) : null,
      method: 'manual',
      isTransfer: !!claim.is_transfer,
      needsReview: true,
      proofCount: uploaded.length,
    });

    return NextResponse.json({ success: true, files: uploaded.length });
  } catch {
    return NextResponse.json({ error: 'Could not attach proof' }, { status: 500 });
  }
}
