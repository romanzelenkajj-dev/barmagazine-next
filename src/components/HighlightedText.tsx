import { highlightSegments } from '@/lib/highlight';

/**
 * Plain text in, text with <strong> spans out — the highlighting rules live
 * in lib/highlight and run at render time only. The source data is and stays
 * plain text.
 */
export function HighlightedText({ text }: { text: string }) {
  const segments = highlightSegments(text);
  return (
    <>
      {segments.map((seg, i) =>
        seg.bold ? <strong key={i}>{seg.text}</strong> : <span key={i}>{seg.text}</span>
      )}
    </>
  );
}
