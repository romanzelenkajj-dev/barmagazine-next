import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // The app's `@/` alias (tsconfig paths), so a test can import a module that
  // itself imports through the alias: src/middleware.ts does, and the slug
  // redirect test (task 110) drives the real middleware.
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  // Disable PostCSS auto-discovery. Vite (which vitest builds on) otherwise
  // walks up looking for postcss.config.mjs and tries to resolve its plugins.
  // Our postcss.config references tailwindcss, which sometimes can't be
  // resolved through pnpm's symlinked node_modules — vite then throws an
  // unhandled rejection that leaves vitest with exit 0 but ZERO tests run.
  // We don't import any CSS in tests; skip the whole pipeline.
  css: { postcss: { plugins: [] } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.mjs'],
    // Fast-fail: tests are part of `prebuild`. We want loud, immediate
    // failure if something regresses, not a long test run on a broken state.
    bail: 1,
  },
});
