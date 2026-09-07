/**
 * Bounded fetch wrappers for every Supabase client.
 *
 * Sept 4-5 incident: Supabase intermittently answered with Cloudflare 522
 * and our unbounded fetches hung until the 300s function limit - 772
 * timeouts, 593 affected users, "your website is down" from a partner.
 * No render is allowed to wait on the DB again:
 *
 *   - each attempt aborts at 5s
 *   - reads (GET/HEAD) get ONE quick retry; writes never retry (a timed-out
 *     insert may have committed - retrying could double-write)
 *   - a 5xx body (Cloudflare 522 included) counts as a failed attempt
 *   - final failure THROWS, so supabase-js surfaces an error immediately and
 *     the data layer's throw-on-error keeps ISR serving the stale page
 *
 * Two cache flavors:
 *   - boundedNoStoreFetch: claim / owner / admin paths, where a stale read
 *     is a correctness bug (the Data-Cache 401 incident)
 *   - boundedPublicFetch: public directory reads, which share a 300s
 *     Data-Cache entry so page regenerations and API calls stop hammering
 *     the DB with identical queries
 */

const ATTEMPT_TIMEOUT_MS = 5000;
const RETRY_DELAY_MS = 400;

function makeBoundedFetch(init2: { cache?: RequestCache; revalidate?: number }): typeof fetch {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const method = (init?.method || 'GET').toUpperCase();
    const attempts = method === 'GET' || method === 'HEAD' ? 2 : 1;
    let lastError: unknown = new Error('supabase fetch failed');

    for (let i = 0; i < attempts; i++) {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), ATTEMPT_TIMEOUT_MS);
      try {
        const merged: RequestInit = { ...init, signal: ctl.signal };
        if (init2.cache) merged.cache = init2.cache;
        if (init2.revalidate != null) {
          (merged as RequestInit & { next: { revalidate: number } }).next = {
            revalidate: init2.revalidate,
          };
        }
        const res = await fetch(input, merged);
        clearTimeout(timer);
        if (res.status >= 500 && i < attempts - 1) {
          lastError = new Error(`supabase upstream ${res.status}`);
          // fall through to retry
        } else {
          return res;
        }
      } catch (e) {
        clearTimeout(timer);
        lastError = e;
      }
      if (i < attempts - 1) await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
    throw lastError;
  };
}

/** For claim/owner/admin paths: always live, never cached, never hanging. */
export const boundedNoStoreFetch = makeBoundedFetch({ cache: 'no-store' });

/** For public directory reads: shared 300s Data-Cache entry, never hanging.
    In the browser the `next` option is ignored and only the bound applies. */
export const boundedPublicFetch = makeBoundedFetch({ revalidate: 300 });
