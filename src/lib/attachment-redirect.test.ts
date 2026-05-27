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

    it('file extensions in slug shape (dash or dot before ext)', () => {
      expect(attachmentRedirectTarget('/article-slug/photo-jpg')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/photo-name-png')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/photo.jpg')).toBe('/article-slug');
      expect(attachmentRedirectTarget('/article-slug/foo.gif')).toBe('/article-slug');
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
