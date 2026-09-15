import { describe, it, expect } from 'vitest';
import { splitHighlight } from './menu-highlight';

describe('splitHighlight', () => {
  it('keeps separate name and ingredients as they are', () => {
    expect(splitHighlight({ name: 'Irish Coffee', ingredients: 'Jameson Caskmates, cream, nutmeg' }))
      .toEqual({ name: 'Irish Coffee', ingredients: 'Jameson Caskmates, cream, nutmeg' });
  });
  it('splits a name that carries the ingredients after an em dash', () => {
    expect(splitHighlight({ name: 'Irish Coffee — Jameson Caskmates, cream' }))
      .toEqual({ name: 'Irish Coffee', ingredients: 'Jameson Caskmates, cream' });
  });
  it('splits on an en dash or a spaced hyphen too', () => {
    expect(splitHighlight({ name: 'Sgroppino – lemon sorbet, prosecco' }).ingredients).toBe('lemon sorbet, prosecco');
    expect(splitHighlight({ name: 'Droplet - gin, aquavit' })).toEqual({ name: 'Droplet', ingredients: 'gin, aquavit' });
  });
  it('shows a dashless value as the name with no ingredients', () => {
    expect(splitHighlight({ name: 'Negroni' })).toEqual({ name: 'Negroni', ingredients: null });
  });
  it('does not split a hyphenated name and never renders an em dash', () => {
    expect(splitHighlight({ name: 'Mai-Tai' })).toEqual({ name: 'Mai-Tai', ingredients: null });
    const r = splitHighlight({ name: 'Old Fashioned', ingredients: 'bourbon — demerara — bitters' });
    expect(r.ingredients).toBe('bourbon, demerara, bitters');
    expect(`${r.name}${r.ingredients}`).not.toMatch(/[—–]/);
  });
});
