'use client';

/**
 * The owner's description beside a house-style rewrite, in the admin review.
 *
 * WHY THIS IS NOT AUTOMATIC. Silently rewriting an owner's words publishes a
 * factual error in their voice and they notice. The decision stays human:
 * this panel writes nothing, it only decides which text the Approve call
 * sends. The owner's original always stays on the submission row.
 *
 * The rewrite itself is deterministic and lives in lib/house-style.ts. It can
 * delete, reorder and substitute; it cannot invent, which is why a draft that
 * comes out under the minimum says so rather than padding.
 */
import { useMemo, useState } from 'react';
import {
  rewriteToHouseStyle, checkHouseStyle, HOUSE_STYLE_SUMMARY, MIN_WORDS, MAX_WORDS,
} from '@/lib/house-style';

export type DescriptionChoice = { text: string; source: 'owner' | 'rewrite' | 'edited' };

const countWords = (s: string) => (s.trim() ? s.trim().split(/\s+/).length : 0);

export function DescriptionReview({
  description, barName, choice, onChange, disabled,
}: {
  description: string;
  barName?: string;
  /**
   * The parent's record of what Approve will send. This panel is controlled
   * BY that record rather than keeping its own: when it kept its own, a list
   * refresh remounted the panel and it reset to "nothing chosen" while the
   * parent still held the rewrite, so the line saying what was about to
   * publish disagreed with what actually would. On the one screen where a
   * mis-click writes to a live profile, that is the bug that matters.
   */
  choice?: DescriptionChoice;
  /** Called whenever the reviewer picks, so the parent knows what Approve will send. */
  onChange: (choice: DescriptionChoice) => void;
  disabled?: boolean;
}) {
  const rewrite = useMemo(() => rewriteToHouseStyle(description, barName), [description, barName]);
  const ownerIssues = useMemo(() => checkHouseStyle(description), [description]);

  const picked = choice?.source ?? null;
  const editing = picked === 'edited';
  const [draft, setDraft] = useState(rewrite.text);

  const choose = (source: 'owner' | 'rewrite' | 'edited', text: string) => {
    onChange({ text, source });
  };

  const box: React.CSSProperties = {
    border: '1px solid #e6e2da', borderRadius: 10, padding: 12, background: '#fff',
    fontSize: 13.5, lineHeight: 1.55, color: '#333', whiteSpace: 'pre-wrap',
  };
  const chosenBox: React.CSSProperties = { ...box, borderColor: '#1a1a1a', boxShadow: '0 0 0 2px rgba(26,26,26,0.08)' };
  const label: React.CSSProperties = {
    fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
    color: '#8a8378', margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: 8,
  };
  const btn = (active: boolean): React.CSSProperties => ({
    padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer',
    border: active ? 'none' : '1px solid #ddd',
    background: active ? '#1a1a1a' : 'transparent',
    color: active ? '#fff' : '#555',
    opacity: disabled ? 0.5 : 1,
  });
  const flag = (bg: string, fg: string): React.CSSProperties => ({
    fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100, background: bg, color: fg,
  });

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, marginBottom: 12 }}>
      <div className="desc-review-grid" style={{ display: 'grid', gap: 12 }}>
        {/* Owner's words, always kept, always shown. */}
        <div>
          <p style={label}>
            Owner&rsquo;s text
            <span style={flag('#f4f2ee', '#8a8378')}>{countWords(description)} words</span>
          </p>
          <div style={picked === 'owner' ? chosenBox : box}>{description}</div>
          {ownerIssues.length > 0 && (
            <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 12, color: '#a8632a', lineHeight: 1.5 }}>
              {ownerIssues.map((v, i) => <li key={i}>{v.problem}</li>)}
            </ul>
          )}
        </div>

        {/* The draft. */}
        <div>
          <p style={label}>
            House-style rewrite
            <span style={flag(
              rewrite.wordCount >= MIN_WORDS && rewrite.wordCount <= MAX_WORDS ? '#e7f5ec' : '#fdf1e3',
              rewrite.wordCount >= MIN_WORDS && rewrite.wordCount <= MAX_WORDS ? '#1c7a42' : '#a8632a',
            )}>{rewrite.wordCount} words</span>
          </p>
          {editing ? (
            <textarea
              value={choice?.text ?? draft}
              onChange={e => { setDraft(e.target.value); onChange({ text: e.target.value, source: 'edited' }); }}
              rows={8}
              style={{ ...chosenBox, width: '100%', fontFamily: 'inherit', resize: 'vertical' }}
            />
          ) : (
            <div style={picked === 'rewrite' ? chosenBox : box}>{rewrite.text || <em style={{ color: '#a8632a' }}>Nothing survived the rewrite.</em>}</div>
          )}
          {rewrite.notes.length > 0 && (
            <ul style={{ margin: '8px 0 0', padding: '0 0 0 16px', fontSize: 12, color: '#6b6459', lineHeight: 1.5 }}>
              {rewrite.notes.map((n, i) => <li key={i}>{n}</li>)}
            </ul>
          )}
          {rewrite.warnings.map((w, i) => (
            <p key={i} style={{ margin: '8px 0 0', fontSize: 12, color: '#a8632a', lineHeight: 1.5 }}>
              <strong>Needs you:</strong> {w}
            </p>
          ))}
        </div>
      </div>

      {/* The three actions. Nothing is written until one is chosen. */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
        <button type="button" disabled={disabled} style={btn(picked === 'rewrite')}
          onClick={() => choose('rewrite', rewrite.text)}>
          Use the rewrite
        </button>
        <button type="button" disabled={disabled} style={btn(picked === 'edited')}
          onClick={() => { setDraft(draft || rewrite.text); choose('edited', draft || rewrite.text); }}>
          Edit it first
        </button>
        <button type="button" disabled={disabled} style={btn(picked === 'owner')}
          onClick={() => choose('owner', description)}>
          Keep the owner&rsquo;s text
        </button>
      </div>

      {/* The one place a mis-click writes to a live profile, so it says which. */}
      <p style={{
        margin: '10px 0 0', fontSize: 12.5, lineHeight: 1.5,
        color: picked ? '#1c7a42' : '#a8632a', fontWeight: 600,
      }}>
        {picked
          ? `Approve will publish: ${picked === 'owner' ? "the owner's text" : picked === 'rewrite' ? 'the house-style rewrite' : 'your edited version'}.`
          : 'Nothing chosen yet. Approve will publish the owner’s text as submitted.'}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: 11.5, color: '#9a9284', lineHeight: 1.5 }}>
        The owner&rsquo;s original is kept on the submission either way. House style: {HOUSE_STYLE_SUMMARY}
      </p>
    </div>
  );
}
