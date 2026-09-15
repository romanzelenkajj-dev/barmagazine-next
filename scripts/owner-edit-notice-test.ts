/**
 * Task 15 test rig for the owner-edit notice. Creates no rows.
 *
 *   node scripts/run-owner-edit-notice-test.mjs dry    -> compose from Holiday's real
 *                                                         2026-09-15 rows, print, send nothing
 *   node scripts/run-owner-edit-notice-test.mjs send   -> one email to office@, subject
 *                                                         prefixed [Test], body says so
 *
 * Bundled by scripts/run-owner-edit-notice-test.mjs (esbuild), which also loads
 * RESEND_API_KEY from .env.vercel and the Supabase keys from .env.local.
 */
import { createClient } from '@supabase/supabase-js';
import {
  ownerEditNotice,
  composeOwnerEditNotice,
  batchFor,
  OWNER_EDIT_INBOX,
  type SubmissionRow,
} from '../src/lib/owner-edit-notice';
import { sendMail } from '../src/lib/mail';

const mode = process.argv[2] || 'dry';
const HOLIDAY_ID = 'bd651d67-25fc-4b51-a0b0-7425fbdec63f';

async function main() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  const { data: rows, error } = await supabase
    .from('owner_submissions')
    .select('id, owner_id, status, submission_type, submitted_data, created_at')
    .eq('bar_id', HOLIDAY_ID)
    .gte('created_at', '2026-09-15T20:00:00Z')
    .order('created_at', { ascending: false });
  if (error || !rows?.length) throw new Error(`rows: ${error?.message || 'none'}`);
  const ownerId = String(rows[0].owner_id);
  const { data: owner } = await supabase.from('bar_owners').select('email').eq('id', ownerId).maybeSingle();
  const ownerEmail = String(owner?.email || 'unknown');
  const newest = rows[0];
  console.log(`rows for Holiday since 20:00Z: ${rows.map(r => `${r.id.slice(0, 8)} ${r.created_at.slice(11, 19)} ${r.submission_type} ${r.status}`).join(' | ')}`);

  if (mode === 'dry') {
    // The real code path with the wait set to zero, against the live rows.
    const result = await ownerEditNotice(
      { barId: HOLIDAY_ID, ownerId, ownerEmail, submissionId: String(newest.id) },
      { delayMs: 0, dryRun: true }
    );
    console.log('result:', result);
    // And the yield case: the older row's notice must defer to the newer one.
    const older = rows[rows.length - 1];
    const deferred = await ownerEditNotice(
      { barId: HOLIDAY_ID, ownerId, ownerEmail, submissionId: String(older.id) },
      { delayMs: 0, dryRun: true }
    );
    console.log('older row result:', deferred);
    return;
  }

  if (mode === 'send') {
    const batch = batchFor(rows as SubmissionRow[], String(newest.id));
    const { subject, text } = composeOwnerEditNotice({
      bar: { name: 'Holiday', city: 'Austin', country: 'United States', state: 'TX' },
      ownerEmail,
      rows: batch,
    });
    const body =
      'Test message for the new owner-edit notice (queue task 15). ' +
      'These Holiday edits were already reviewed today; nothing new is waiting.\n\n' + text;
    const ok = await sendMail({ to: OWNER_EDIT_INBOX, subject: `[Test] ${subject}`, text: body, context: 'owner-edit-notice-test' });
    console.log('sent:', ok);
    return;
  }
  throw new Error(`unknown mode ${mode}`);
}

main().catch(e => { console.error(e); process.exit(1); });
