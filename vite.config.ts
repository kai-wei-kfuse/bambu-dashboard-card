import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: 'src/card.ts',
      formats: ['es'],
      fileName: () => 'bambu-dashboard-card.js',
    },
    sourcemap: true,
    target: 'es2022',
  },
});
