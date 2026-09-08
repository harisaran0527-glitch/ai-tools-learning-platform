import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split category data modules into separate chunks
          if (id.includes('src/data/catalog/categories')) {
            const parts = id.split('categories');
            const file = parts[1].replace(/\\.[tj]sx?$/, '');
            const name = file.replace(/\\W+/g, '-');
            return `category-${name}`;
          }
          // Separate assessment engine code
          if (id.includes('src/lib/assessmentEngine')) {
            return 'assessmentEngine';
          }
          // Vendor chunk for node_modules
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
      },
    },
  },
});
