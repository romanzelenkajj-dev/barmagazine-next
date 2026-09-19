'use client';

/**
 * Correct a submission's fields before approving it.
 *
 * WHY. The review screen offered Approve and publish, or Reject, and nothing
 * in between. A submission that was right except for one badly formatted field
 * had to be rejected whole, or published wrong and fixed afterwards in the bar
 * admin. Prophecy's opening hours were the case that made it obvious: a format
 * matching nothing else in the directory, and no way to touch it.
 *
 * Task 66 built this for the description. This is the same idea for every
 * other field the submission carries.
 *
 * Nothing is written here. The component reports the edited values upwards and
 * the Approve call sends them; bar_submissions keeps the owner's original
 * untouched either way, so we can always show them what they sent.
 */
import { useState } from 'react';

/** Must stay in step with EDITABLE in api/admin/submissions/route.ts. */
export const EDITABLE_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'city', label: 'City' },
  { key: 'country', label: 'Country' },
  { key: 'type', label: 'Type' },
  { key: 'address', label: 'Address' },
  { key: 'opening_hours', label: 'Opening hours' },
  { key: 'website', label: 'Website' },
  { key: 'instagram', label: 'Instagram' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
] as const;

export type FieldKey = typeof EDITABLE_FIELDS[number]['key'];

/** Characters we never publish, so the reviewer sees them before they land. */
const TYPOGRAPHY_WARNINGS: { test: RegExp; note: string }[] = [
  { test: /—/, note: 'contains an em dash' },
  { test: /\s-\s/, note: 'uses a spaced hyphen as punctuation' },
];

export function EditableSubmissionFields({
  values, edits, onChange, disabled,
}: {
  /** What the owner submitted. Never mutated. */
  values: Partial<Record<FieldKey, string | undefined>>;
  /** The reviewer's corrections so far, held by the parent. */
  edits: Partial<Record<FieldKey, string>>;
  onChange: (key: FieldKey, value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const edited = Object.keys(edits).filter(k => edits[k as FieldKey] !== undefined);

  const shown = EDITABLE_FIELDS.filter(f => values[f.key] || edits[f.key] !== undefined);

  const input: React.CSSProperties = {
    width: '100%', fontFamily: 'inherit', fontSize: 13.5, padding: '7px 10px',
    border: '1px solid #e0d8d0', borderRadius: 8, outline: 'none', background: '#fff',
  };
  const changed: React.CSSProperties = { ...input, borderColor: '#1a1a1a', background: '#fffdf7' };

  return (
    <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 12, marginBottom: 12 }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          fontSize: 12.5, fontWeight: 700, letterSpacing: '0.04em', color: '#6b6459',
        }}
      >
        {open ? '▾' : '▸'} Edit fields before approving
        {edited.length > 0 && (
          <span style={{
            marginLeft: 8, background: '#1a1a1a', color: '#fff', fontSize: 11,
            fontWeight: 700, padding: '2px 8px', borderRadius: 100,
          }}>
            {edited.length} edited
          </span>
        )}
      </button>

      {open && (
        <div className="submission-edit-grid" style={{ display: 'grid', gap: 10, marginTop: 12 }}>
          {shown.map(f => {
            const original = values[f.key] ?? '';
            const current = edits[f.key] ?? original;
            const isChanged = edits[f.key] !== undefined && edits[f.key] !== original;
            const warns = TYPOGRAPHY_WARNINGS.filter(w => w.test.test(current)).map(w => w.note);
            return (
              <label key={f.key} style={{ display: 'block' }}>
                <span style={{
                  display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.07em', color: '#8a8378', marginBottom: 4,
                }}>
                  {f.label}{isChanged && <span style={{ color: '#1c7a42' }}> · edited</span>}
                </span>
                <input
                  type="text"
                  value={current}
                  disabled={disabled}
                  onChange={e => onChange(f.key, e.target.value)}
                  style={isChanged ? changed : input}
                />
                {warns.length > 0 && (
                  <span style={{ display: 'block', fontSize: 11.5, color: '#a8632a', marginTop: 3 }}>
                    {warns.join(', ')}
                  </span>
                )}
                {isChanged && (
                  <span style={{ display: 'block', fontSize: 11.5, color: '#9a9284', marginTop: 3 }}>
                    owner sent: {original || <em>nothing</em>}
                  </span>
                )}
              </label>
            );
          })}
        </div>
      )}

      {edited.length > 0 && !open && (
        <p style={{ margin: '8px 0 0', fontSize: 12.5, color: '#1c7a42', fontWeight: 600 }}>
          Approve will publish {edited.length} corrected field{edited.length > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}
