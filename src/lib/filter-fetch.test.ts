import { describe, it, expect } from 'vitest';
import { fetchAllMatching, FILTER_PAGE_SIZE } from './filter-fetch';

/** An API that holds `n` matching bars and serves them the way /api/bars does. */
function apiWith(n: number) {
  const all = Array.from({ length: n }, (_, i) => ({ id: `bar-${i + 1}` }));
  const calls: number[] = [];
  const fetchPage = async (page: number, perPage: number) => {
    calls.push(page);
    const from = (page - 1) * perPage;
    return { bars: all.slice(from, from + perPage), total: n, page, perPage };
  };
  return { fetchPage, calls };
}

describe('fetchAllMatching', () => {
  it('reports the true total for a filter with more than 1,000 matches', async () => {
    const api = apiWith(1651);
    const { bars, total } = await fetchAllMatching(api.fetchPage);
    expect(total).toBe(1651);
    expect(bars).toHaveLength(1651);
    expect(new Set(bars.map(b => b.id)).size).toBe(1651);
    expect(api.calls).toEqual([1, 2]);
  });

  it('makes one request when the set fits in a page', async () => {
    const api = apiWith(30);
    const { bars, total } = await fetchAllMatching(api.fetchPage);
    expect(total).toBe(30);
    expect(bars).toHaveLength(30);
    expect(api.calls).toEqual([1]);
  });

  it('keeps paging across several full pages', async () => {
    const api = apiWith(FILTER_PAGE_SIZE * 2 + 5);
    const { bars, total } = await fetchAllMatching(api.fetchPage);
    expect(total).toBe(2005);
    expect(bars).toHaveLength(2005);
    expect(api.calls).toEqual([1, 2, 3]);
  });

  it('counts a bar once if it shifts between pages', async () => {
    const api = apiWith(1200);
    const fetchPage = async (page: number, perPage: number) => {
      const r = await api.fetchPage(page, perPage);
      // The last row of page 1 also turns up first on page 2.
      return page === 2 ? { ...r, bars: [{ id: 'bar-1000' }, ...r.bars] } : r;
    };
    const { bars, total } = await fetchAllMatching(fetchPage);
    expect(bars).toHaveLength(1200);
    expect(total).toBe(1200);
  });

  it('falls back to the rows when the API sends no total', async () => {
    const { bars, total } = await fetchAllMatching(async () => ({ bars: [{ id: 'a' }, { id: 'b' }] }));
    expect(bars).toHaveLength(2);
    expect(total).toBe(2);
  });
});
