import { describe, it, expect } from 'vitest';
import robots, { BLOCKED_PATHS } from './robots';

/**
 * Regression guard for B6 (robots.txt cleanup) and surrounding policy.
 *
 * The point of these tests is not to pin down every exact path in the
 * disallow list — paths come and go as the app evolves. The point is to
 * lock in the SHAPE of the policy:
 *
 *   1. WP-era paths must NEVER come back. They were dead weight on a
 *      pure Next.js frontend and slightly misleading to crawlers.
 *   2. Build-asset / API paths must always be blocked.
 *   3. The sitemap index must be advertised.
 *   4. Every userAgent rule shares the same disallow list — this is the
 *      "AI crawlers honor the same exclusions" property documented in
 *      robots.ts.
 */
describe('robots.txt policy', () => {
  it('does NOT include any WP-era paths (B6 — those are not part of this site)', () => {
    const wpEraPaths = ['/wp-admin/', '/wp-content/', '/wp-includes/', '/wp-json/'];
    for (const path of wpEraPaths) {
      expect(
        BLOCKED_PATHS,
        `${path} must not be in BLOCKED_PATHS — it doesn't exist on this Next.js frontend`,
      ).not.toContain(path);
    }
  });

  it('blocks build-asset and server-API paths', () => {
    expect(BLOCKED_PATHS).toContain('/api/');
    expect(BLOCKED_PATHS).toContain('/_next/');
    expect(BLOCKED_PATHS).toContain('/cdn-cgi/');
  });

  it('keeps the legacy WP query-string shapes (harmless, still hit by stale links)', () => {
    expect(BLOCKED_PATHS).toContain('/?s=');
    expect(BLOCKED_PATHS).toContain('/?p=');
    expect(BLOCKED_PATHS).toContain('/?page_id=');
  });

  it('every userAgent rule shares the same disallow list', () => {
    const cfg = robots();
    const rules = Array.isArray(cfg.rules) ? cfg.rules : [cfg.rules!];
    expect(rules.length).toBeGreaterThanOrEqual(2);
    for (const rule of rules) {
      expect(
        rule.disallow,
        `userAgent ${rule.userAgent} must share the canonical disallow list`,
      ).toEqual(BLOCKED_PATHS);
    }
  });

  it('explicitly addresses the AI crawlers we care about', () => {
    const cfg = robots();
    const rules = Array.isArray(cfg.rules) ? cfg.rules : [cfg.rules!];
    const userAgents = rules.map((r) => r.userAgent);
    // The "*" rule covers everything, but we want explicit rules for AI bots
    // so future tweaks (e.g., changing crawl-delay for one bot) have a place
    // to land without affecting the rest.
    expect(userAgents).toContain('GPTBot');
    expect(userAgents).toContain('ChatGPT-User');
    expect(userAgents).toContain('ClaudeBot');
    expect(userAgents).toContain('PerplexityBot');
    expect(userAgents).toContain('Google-Extended');
  });

  it('advertises the sitemap index', () => {
    const cfg = robots();
    const sitemap = Array.isArray(cfg.sitemap) ? cfg.sitemap : [cfg.sitemap!];
    expect(sitemap).toContain('https://barmagazine.com/sitemap.xml');
  });
});
