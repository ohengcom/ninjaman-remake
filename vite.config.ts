import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  // Only `static/` is served and copied to `dist/` — keeps the 3000+ legacy
  // Flash sprite frames in `public/` out of the production build.
  publicDir: 'static',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    target: 'es2020',
    sourcemap: false,
    minify: 'esbuild',
    cssMinify: true,
    chunkSizeWarningLimit: 2000,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/phaser')) return 'phaser';
        },
      },
    },
  },
  server: {
    port: 3000,
    open: true,
    host: true,
  },
  preview: {
    port: 4173,
    host: true,
  },
});
