import { describe, it, expect } from 'vitest';
import { firstSentence, firstSentences } from './first-sentence';

describe('firstSentence (list-page band, task 112)', () => {
  it('returns the first sentence whole', () => {
    expect(firstSentence('Mumbai drinking starts with The Bombay Canteen. The bench behind it runs deep.')).toBe(
      'Mumbai drinking starts with The Bombay Canteen.',
    );
  });

  it('does not stop at "No." or a rank', () => {
    const s = 'Mumbai drinking starts with The Bombay Canteen, No. 69 on Asia\'s 50 Best Bars 2025, and the bench behind it runs deep. Below are the five.';
    expect(firstSentence(s)).toBe('Mumbai drinking starts with The Bombay Canteen, No. 69 on Asia\'s 50 Best Bars 2025, and the bench behind it runs deep.');
  });

  it('does not stop at an abbreviation followed by a lower-case word', () => {
    expect(firstSentence('The bars of St. James are few. Two are here.')).toBe('The bars of St. James are few.');
  });

  it('handles ! and ? and a closing quote', () => {
    expect(firstSentence('What a list! Next year again.')).toBe('What a list!');
    expect(firstSentence('He called it "the one." Others agreed.')).toBe('He called it "the one."');
  });

  it('returns the whole text when there is one sentence, and empty for nothing', () => {
    expect(firstSentence('One sentence only')).toBe('One sentence only');
    expect(firstSentence('')).toBe('');
    expect(firstSentence(null)).toBe('');
  });
});

describe('firstSentences', () => {
  it('returns the first two sentences whole and the whole text when shorter', () => {
    const intro = "London's scene runs from hotel rooms to counters, and the panels agree: two bars sit in the top ten. Beyond the famous names, our list reaches Shoreditch. A third sentence follows.";
    expect(firstSentences(intro, 2)).toBe("London's scene runs from hotel rooms to counters, and the panels agree: two bars sit in the top ten. Beyond the famous names, our list reaches Shoreditch.");
    expect(firstSentences('One sentence only.', 2)).toBe('One sentence only.');
    expect(firstSentences('', 2)).toBe('');
  });
});
