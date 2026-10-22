import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/card.ts',
      formats: ['es'],
      fileName: () => 'bambu-dashboard-card.js',
    },
    sourcemap: false,
    target: 'es2022',
  },
});
