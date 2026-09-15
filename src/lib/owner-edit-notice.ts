import { createClient } from '@supabase/supabase-js';
import { sendMail } from './mail';
import { boundedNoStoreFetch } from './bounded-fetch';
import { ownerFieldLabel } from './owner-fields';
import { placeLine } from './city-location';

/**
 * "Edit to approve" notice: one plain-text email to the office inbox for
 * every owner-submitted edit (info update or photo upload).
 *
 * Batching. An owner who saves the form and then adds a photo produces two
 * `owner_submissions` rows a few seconds apart (Holiday, 2026-09-15, 16 s).
 * Each route schedules a notice for its own row, but the notice waits
 * DEBOUNCE_MS after the response has gone out and then looks again: if a
 * newer row from the same owner for the same bar has arrived meanwhile, this
 * notice steps aside and the newer row's notice covers both. The notice that
 * does send walks back through the rows that arrived less than CHAIN_GAP_MS
 * apart and lists them all. CHAIN_GAP_MS is a little longer than DEBOUNCE_MS
 * so a row seen by the earlier check is always inside the later chain; the
 * cost of the slack is that a row landing in that window can be listed twice,
 * never that it goes unlisted.
 *
 * The wait runs inside Vercel's waitUntil, so the owner's request returns at
 * once; the two routes set maxDuration high enough for the wait to finish.
 * Sends are best-effort and never throw: the submission is already stored.
 */

export const OWNER_EDIT_INBOX = 'office@barmagazine.com';
export const ADMIN_EDITS_URL = 'https://barmagazine.com/admin/review?tab=edits';
export const DEBOUNCE_MS = 60_000;
export const CHAIN_GAP_MS = 75_000;

export interface SubmissionRow {
  id: string;
  status: string;
  submission_type: string;
  submitted_data: Record<string, unknown> | null;
  created_at: string;
}

export interface NoticeBar {
  name: string;
  city: string;
  country: string;
  state?: string | null;
}

/**
 * The rows one email covers, given every row for this bar and owner (any
 * order) and the row the notice was scheduled for. Newest first. Walks back
 * from the anchor while consecutive rows are less than CHAIN_GAP_MS apart;
 * rows newer than the anchor are not included (their own notice covers them).
 */
export function batchFor(rows: SubmissionRow[], anchorId: string): SubmissionRow[] {
  const sorted = [...rows].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at));
  const start = sorted.findIndex(r => r.id === anchorId);
  if (start < 0) return [];
  const out = [sorted[start]];
  for (let i = start + 1; i < sorted.length; i++) {
    const gap = Date.parse(out[out.length - 1].created_at) - Date.parse(sorted[i].created_at);
    if (gap >= CHAIN_GAP_MS) break;
    out.push(sorted[i]);
  }
  return out;
}

/** True when a row newer than the anchor exists: the anchor's notice yields. */
export function hasNewerThan(rows: SubmissionRow[], anchorId: string): boolean {
  const anchor = rows.find(r => r.id === anchorId);
  if (!anchor) return false;
  const t = Date.parse(anchor.created_at);
  return rows.some(r => r.id !== anchorId && Date.parse(r.created_at) > t);
}

const MAX_VALUE = 300;

/** One line per field: the proposed value, or "1 photo" plus the URLs. */
export function describeField(key: string, value: unknown): string[] {
  const label = ownerFieldLabel(key);
  if (key === 'gallery_images' || key === 'photos') {
    const urls = Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
    const n = urls.length;
    return [`${label}: ${n} photo${n === 1 ? '' : 's'}`, ...urls.map(u => `  ${u}`)];
  }
  let rendered: string;
  if (value == null || value === '') rendered = '(cleared)';
  else if (Array.isArray(value)) rendered = `${value.length} item${value.length === 1 ? '' : 's'}`;
  else if (typeof value === 'object') rendered = JSON.stringify(value);
  else rendered = String(value);
  rendered = rendered.replace(/\s+/g, ' ').trim();
  if (rendered.length > MAX_VALUE) rendered = `${rendered.slice(0, MAX_VALUE)} (truncated)`;
  return [`${label}: ${rendered}`];
}

/** Field labels in order of first appearance across the batch, no repeats. */
export function fieldLabels(rows: SubmissionRow[]): string[] {
  const seen: string[] = [];
  for (const row of [...rows].reverse()) {
    for (const key of Object.keys(row.submitted_data || {})) {
      const label = ownerFieldLabel(key);
      if (!seen.includes(label)) seen.push(label);
    }
  }
  return seen;
}

function ptStamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const s = d.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
  return `${s} PT`;
}

export interface ComposeInput {
  bar: NoticeBar;
  ownerEmail: string;
  /** Newest first, as batchFor returns them. */
  rows: SubmissionRow[];
  /** Keys the allowlist dropped on the anchor submission. */
  rejected?: string[];
}

/** Subject and plain-text body for one notice. */
export function composeOwnerEditNotice(input: ComposeInput): { subject: string; text: string } {
  const { bar, ownerEmail, rows, rejected = [] } = input;
  const labels = fieldLabels(rows);
  const subject = `Edit to approve: ${bar.name} (${labels.join(', ') || 'no fields'})`;

  const oldestFirst = [...rows].reverse();
  const lines: string[] = [];
  lines.push(`Bar: ${bar.name}, ${placeLine(bar)}`);
  lines.push(`Owner: ${ownerEmail}`);
  const when = oldestFirst.length === 1
    ? ptStamp(oldestFirst[0].created_at)
    : `${ptStamp(oldestFirst[0].created_at)}, ${oldestFirst.length} submissions within a minute`;
  lines.push(`Submitted: ${when}`);
  lines.push('');

  for (const row of oldestFirst) {
    const data = row.submitted_data || {};
    for (const [key, value] of Object.entries(data)) lines.push(...describeField(key, value));
    if (row.status !== 'pending') lines.push(`  (already ${row.status})`);
  }

  if (rejected.length) {
    lines.push('');
    lines.push(`Dropped by the field allowlist: ${rejected.join(', ')}`);
  }

  lines.push('');
  lines.push('Nothing is live until you approve it.');
  lines.push(`Approve or reject: ${ADMIN_EDITS_URL}`);
  return { subject, text: lines.join('\n') };
}

export interface ScheduleInput {
  barId: string;
  ownerId: string;
  ownerEmail: string;
  /** The row this notice was scheduled for. */
  submissionId: string;
  rejected?: string[];
}

export interface ScheduleOptions {
  /** Shorter in tests; the real routes use DEBOUNCE_MS. */
  delayMs?: number;
  /** Compose and log, send nothing. */
  dryRun?: boolean;
  /** Override for tests; defaults to the service-role client. */
  client?: ReturnType<typeof createClient>;
}

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { global: { fetch: boundedNoStoreFetch } }
  );
}

/**
 * Wait, look again, and send at most one email for the batch this row ends.
 * Resolves to 'sent', 'deferred' (a newer row's notice will cover this one),
 * 'dry-run', or 'failed'. Never throws.
 */
export async function ownerEditNotice(
  input: ScheduleInput,
  opts: ScheduleOptions = {}
): Promise<'sent' | 'deferred' | 'dry-run' | 'failed'> {
  const { barId, ownerId, ownerEmail, submissionId, rejected } = input;
  const delay = opts.delayMs ?? DEBOUNCE_MS;
  try {
    if (delay > 0) await new Promise(r => setTimeout(r, delay));
    const supabase = opts.client ?? adminClient();

    const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
    const { data: rowsRaw, error } = await supabase
      .from('owner_submissions')
      .select('id, status, submission_type, submitted_data, created_at')
      .eq('bar_id', barId)
      .eq('owner_id', ownerId)
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('[owner-edit-notice] rows query failed:', error.message);
      return 'failed';
    }
    const rows = (rowsRaw || []) as SubmissionRow[];
    if (hasNewerThan(rows, submissionId)) {
      console.log(`[owner-edit-notice] ${submissionId} deferred to a newer submission`);
      return 'deferred';
    }
    const batch = batchFor(rows, submissionId);
    if (batch.length === 0) {
      // The row is gone (hard-deleted in review before the wait ended): say
      // so rather than announce nothing, so the queue is never silent.
      console.warn(`[owner-edit-notice] ${submissionId} not found; notice skipped`);
      return 'failed';
    }

    const { data: bar } = await supabase
      .from('bars')
      .select('name, city, country, state')
      .eq('id', barId)
      .maybeSingle();
    const noticeBar: NoticeBar = {
      name: String(bar?.name ?? 'Unknown bar'),
      city: String(bar?.city ?? ''),
      country: String(bar?.country ?? ''),
      state: (bar?.state as string | null | undefined) ?? null,
    };

    const { subject, text } = composeOwnerEditNotice({ bar: noticeBar, ownerEmail, rows: batch, rejected });
    if (opts.dryRun) {
      console.log(`[owner-edit-notice] DRY RUN to ${OWNER_EDIT_INBOX}\nSubject: ${subject}\n\n${text}`);
      return 'dry-run';
    }
    const ok = await sendMail({ to: OWNER_EDIT_INBOX, subject, text, context: 'owner-edit-notice' });
    return ok ? 'sent' : 'failed';
  } catch (e) {
    console.error('[owner-edit-notice] threw:', e);
    return 'failed';
  }
}
