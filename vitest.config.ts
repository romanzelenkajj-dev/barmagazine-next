import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.mjs'],
    // Fast-fail: tests are part of `prebuild`. We want loud, immediate
    // failure if something regresses, not a long test run on a broken state.
    bail: 1,
  },
});
