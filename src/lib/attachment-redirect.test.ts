import { describe, it, expect } from 'vitest';
import { attachmentRedirectTarget } from './attachment-redirect';

describe('attachmentRedirectTarget', () => {
  describe('matches WP image-attachment URLs and returns parent slug', () => {
    it('numeric-prefix filenames', () => {
      expect(attachmentRedirectTarget('/article-slug/01-photo-name-jpg/')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/01-photo-name-jpg')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/1234-foo')).toBe('/article-slug');
    });

    it('IMG_ / img_ camera filenames', () => {
      expect(attachmentRedirectTarget('/article-slug/IMG_4567')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/img_4567')).toBe('/article-slug');
    });

    it('DSC / 0i7a camera filenames', () => {
      expect(attachmentRedirectTarget('/article-slug/dsc09381')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/DSC09381')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/0i7a3499')).toBe('/article-slug');
    });

    it('file extensions in slug shape (dash before ext, no dot)', () => {
      // WP attachment URLs use the dash form: /article/photo-name-jpg.
      // The dotted form (/article/photo.jpg) is excluded because it false-
      // matched real image files in public/banners/, public/images/, etc. —
      // see the public-asset negative tests below + the comment on the
      // ATTACHMENT_TAIL_PATTERNS list in src/lib/attachment-redirect.ts.
      expect(attachmentRedirectTarget('/article-slug/photo-jpg')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/photo-name-png')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/some-shot-jpeg')).toBe('/article-slug');
    });

    it('attachment + attachment/N', () => {
      expect(attachmentRedirectTarget('/article-slug/attachment')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/attachment/8')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/attachment/42')).toBe('/article-slug');
    });

    it('screen-shot and screenshot variants', () => {
      expect(attachmentRedirectTarget('/article-slug/screen-shot-2026-05-01')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/screenshot-2026')).toBe('/article-slug');
    });

    it('untitled, copy-of, copia-de, evoto, bca-', () => {
      expect(attachmentRedirectTarget('/article-slug/untitled-1')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/copy-of-photo')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/copia-de-foto')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/evoto')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/bca-2026-winner')).toBe('/article-slug');
    });

    it('p<digits> WP pagination', () => {
      expect(attachmentRedirectTarget('/article-slug/p1')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/p42')).toBe('/article-slug');
    });
  });

  describe('does NOT redirect — reserved first segments', () => {
    it('preserves /bars/:slug and similar real routes', () => {
      // Even with an attachment-shaped second segment, reserved prefixes
      // are passed through untouched. The real route handler decides.
      expect(attachmentRedirectTarget('/bars/atwater-cocktail-club')).toBeNull();
      expect(attachmentRedirectTarget('/category/cocktails')).toBeNull();
      expect(attachmentRedirectTarget('/events/athens-bar-show-2025')).toBeNull();
      expect(attachmentRedirectTarget('/tag/lima')).toBeNull();
      expect(attachmentRedirectTarget('/api/sitemap-articles')).toBeNull();
      expect(attachmentRedirectTarget('/_next/static/css/foo.css')).toBeNull();
    });

    it('preserves /bars/:slug even when second segment looks like an image', () => {
      // Synthetic case — verifies the reserved guard is load-bearing.
      expect(attachmentRedirectTarget('/bars/IMG_001')).toBeNull();
      expect(attachmentRedirectTarget('/category/01-foo')).toBeNull();
    });

    it('preserves public-asset directories (REGRESSION: PR #52 broke this)', () => {
      // PR #52 shipped the attachment-redirect middleware without 'banners'
      // or 'images' in the reserved-prefix list, AND had a dotted-extension
      // regex that matched real image files. Net effect: every sponsor
      // banner image at /banners/*.jpg got 301'd to /banners → 404,
      // breaking the Flavour Blaster and Pampero Rum sponsor inventory on
      // every article page until this hotfix landed.
      //
      // Both fixes are pinned by these assertions:
      //   1. 'banners' and 'images' are in RESERVED_TOP_LEVEL_PATHS
      //   2. The /\.(jpg|png|...)$/ dotted regex has been removed
      // If either layer is removed, this test fails immediately.
      expect(attachmentRedirectTarget('/banners/flavour-blaster.jpg')).toBeNull();
      expect(attachmentRedirectTarget('/banners/pampero.jpg')).toBeNull();
      expect(attachmentRedirectTarget('/images/some-photo.png')).toBeNull();
      expect(attachmentRedirectTarget('/images/og-banner.jpeg')).toBeNull();
    });

    it('passes through dotted-extension files anywhere (defense-in-depth)', () => {
      // Even if a public/ subdir got added without being put in the reserved
      // list, the dotted-extension regex removal means real image files are
      // not caught. This is the second layer that fires when the reserved
      // list is incomplete (which it inevitably will be at some point).
      expect(attachmentRedirectTarget('/some-future-asset-dir/photo.jpg')).toBeNull();
      expect(attachmentRedirectTarget('/some-future-asset-dir/foo.png')).toBeNull();
    });
  });

  describe('does NOT redirect — non-matching shapes', () => {
    it('single-segment URLs (article pages, /about, etc.)', () => {
      expect(attachmentRedirectTarget('/article-slug')).toBeNull();
      expect(attachmentRedirectTarget('/')).toBeNull();
      expect(attachmentRedirectTarget('')).toBeNull();
    });

    it('two-segment URLs where the second segment is non-image-shaped', () => {
      expect(attachmentRedirectTarget('/article-slug/related-articles')).toBeNull();
      expect(attachmentRedirectTarget('/article-slug/comments')).toBeNull();
      expect(attachmentRedirectTarget('/article-slug/some-other-thing')).toBeNull();
    });

    it('deep paths where the tail does NOT match attachment/N', () => {
      // attachment/N is the only multi-segment match. Anything else falls
      // through unchanged.
      expect(attachmentRedirectTarget('/article-slug/foo/bar/baz')).toBeNull();
      expect(attachmentRedirectTarget('/article-slug/attachment/foo')).toBeNull();
    });
  });
});
