import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` is relative so the built bundle works both at a domain root and under a
// sub-path (GitHub Pages project sites, Firebase Hosting previews) without a rebuild.
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'build',
    // plotly is large and unavoidable; splitting it out keeps the app chunk small
    // enough that a code change does not invalidate the vendor cache entry.
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ['plotly.js-basic-dist-min', 'react-plotly.js/factory'],
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.jsx',
    css: false,
  },
});
