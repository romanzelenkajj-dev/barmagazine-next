import { describe, it, expect } from 'vitest';
import { isSelectiveSource, hasSelectiveSource, strongestSource } from './editorial-sources';

const s = (source: string) => ({ source });

describe('editorial source selectivity', () => {
  it('accepts a guide or award that selects by its own standard', () => {
    for (const n of ['Falstaff Bar Guide 2026 Slovakia', 'Michelin Guide Texas', 'Punch',
                     'Imbibe 75', 'Esquire', 'Speed Rack', 'James Beard Awards, Outstanding Bar semifinalists',
                     'Tales of the Cocktail Spirited Awards, regional honorees']) {
      expect(isSelectiveSource(s(n))).toBe(true);
    }
  });

  it('accepts a bounded Top N', () => {
    expect(isSelectiveSource(s('Refresher.sk Top 5 cocktail bars in Bratislava'))).toBe(true);
    expect(isSelectiveSource(s('SME Closer TOP 8 cocktail bars in Bratislava'))).toBe(true);
    expect(isSelectiveSource(s('Weranda Weekend, Top 8 koktajlbarów w Polsce'))).toBe(true);
    expect(isSelectiveSource(s('The Infatuation, The 19 Best Bars In Atlanta'))).toBe(true);
    expect(isSelectiveSource(s('Atlanta Journal-Constitution, 12 essential Atlanta cocktail bars you need to try'))).toBe(true);
    expect(isSelectiveSource(s('Club Oenologique, Bratislava cocktails: four of the best bars to visit'))).toBe(true);
  });

  it('rejects a list so long it is a directory with a headline', () => {
    expect(isSelectiveSource(s('Atlanta Magazine, 57 Best Bars in Atlanta'))).toBe(false);
    expect(isSelectiveSource(s('Dallas Observer, the 50 best bars in Dallas right now'))).toBe(false);
  });

  it('rejects a tourism page, a festival roster and a bare listing', () => {
    expect(isSelectiveSource(s('Go To Warsaw (Warsaw Tourism Office), Sky-high bars and restaurants with a view of Warsaw'))).toBe(false);
    expect(isSelectiveSource(s('Bratislava Region official tourism board POI listing'))).toBe(false);
    expect(isSelectiveSource(s('World Class Cocktail Festival Slovakia 2025 participant list'))).toBe(false);
    expect(isSelectiveSource(s('Warsaw Insider, Going Out venue listing'))).toBe(false);
  });

  it('rejects a broad city map, which is the admission floor not a pick', () => {
    expect(isSelectiveSource(s('Eater Portland'))).toBe(false);
    expect(isSelectiveSource(s('Eater Dallas'))).toBe(false);
    expect(isSelectiveSource(s('Time Out Atlanta, The best bars in Atlanta right now'))).toBe(false);
  });

  it('handles nothing, null and a wrong shape without throwing', () => {
    expect(isSelectiveSource(undefined)).toBe(false);
    expect(isSelectiveSource({ source: null })).toBe(false);
    expect(hasSelectiveSource(null)).toBe(false);
    expect(hasSelectiveSource('not an array')).toBe(false);
    expect(strongestSource(null)).toBeNull();
  });

  it('one selective source among broad ones is enough, and is the one named', () => {
    const mixed = [s('Eater Portland'), s('Falstaff Bar Guide 2026 Slovakia')];
    expect(hasSelectiveSource(mixed)).toBe(true);
    expect(strongestSource(mixed)?.source).toContain('Falstaff');
  });
});

describe('task 130b: local-language lists, Gault&Millau and sources that never count (Roman, 2026-09-24)', () => {
  const sel = (source: string) => isSelectiveSource({ source });

  it('accepts Gault&Millau in any spelling', () => {
    expect(sel('Gault&Millau Belgium, Cocktail bars')).toBe(true);
    expect(sel('Gault et Millau Suisse, Bars')).toBe(true);
  });

  it('accepts a counted local-language best-of from an established publication', () => {
    expect(sel('Gambero Rosso, I 10 migliori cocktail bar di Napoli (2025)')).toBe(true);
    expect(sel('Trójmiasto.pl, 10 najlepszych barów koktajlowych w Gdańsku (2025)')).toBe(true);
    expect(sel("Le Soir, Les 12 meilleurs bars à cocktails de Bruxelles (2024)")).toBe(true);
    expect(sel("Hürriyet, İstanbul'un en iyi 15 kokteyl barı (2025)")).toBe(true);
    expect(sel('El Tiempo, Los 10 mejores bares de Cartagena (2024)')).toBe(true);
    expect(sel('Jutarnji list, 10 najboljih koktel barova u Zagrebu (2025)')).toBe(true);
    expect(sel('Telegram.hr (Super1), 8 najboljih zagrebačkih barova u koje se nakon posla možete uputiti na prefine koktele (2024)')).toBe(true);
    expect(sel('TorinoToday, Una mappa dei 12 migliori cocktail bar di Torino (2024)')).toBe(true);
    // Gambero Rosso is established, but this title is "to try", not a best-of.
    expect(sel('Gambero Rosso, La nouvelle vague napoletana dei drink: ecco 9 cocktail bar da provare in città (2024)')).toBe(false);
  });

  it('refuses the same list from a publication that is not established', () => {
    expect(sel('Guadalajara Secreta, Estos son los 12 mejores bares de Guadalajara, ¡salud! (2024)')).toBe(false);
    expect(sel('Some Food Blog, I 10 migliori cocktail bar di Bologna (2025)')).toBe(false);
  });

  it('refuses a local list longer than 25, as the English rule does', () => {
    expect(sel('La Tercera Finde, Los 30 mejores bares para visitar en Santiago (2023)')).toBe(false);
  });

  it('refuses a local-language guide with no count', () => {
    expect(sel('El Universal, Guía de bares en Guadalajara: los mejores cócteles de autor de la región (2025)')).toBe(false);
  });

  it('never counts a listicle farm, a booking site, a tour blog or a rival bar, whatever the title', () => {
    expect(sel('Evendo, The 10 Best bars in Bologna (2026 ranked) (2026)')).toBe(false);
    expect(sel('InTravel, Top 20 Best Cocktail Bars in Gdańsk, september 2026 (2026)')).toBe(false);
    expect(sel('Accor Limitless, Discover the 9 Best Bars in Brussels (2026)')).toBe(false);
    expect(sel('City Unscripted, Three Best Cocktail Bars in Brussels (2024)')).toBe(false);
    expect(sel('Into the Bloom, 12 Best Places For a Drink in Gdańsk, Poland (According to a Local) (2026)')).toBe(false);
    expect(sel('Plumette, Top 7 Best Cocktail Bars in Brussels (2026 Insider Guide) (2026)')).toBe(false);
  });

  it('leaves established English lists exactly as they were', () => {
    expect(sel('Time Out, The 20 best bars in Glasgow right now (2023)')).toBe(true);
    expect(sel('The Infatuation, The 11 Best Cocktail Bars In Manchester (2026)')).toBe(true);
    expect(sel('Falstaff, The Best Bars in Stuttgart (2026)')).toBe(true);
  });
});

