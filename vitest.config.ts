import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
    // Phaser is heavy and not needed for pure-data tests; alias it to a stub
    // so importing constants/level-data files (which don't import phaser) stays fast.
  },
});
