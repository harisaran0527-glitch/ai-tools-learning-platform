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
          if (id.includes('src/data/catalog/categories') || id.includes('src\\data\\catalog\\categories')) {
            const basename = path.basename(id, path.extname(id));
            const safeName = basename.replace(/[^a-zA-Z0-9_-]/g, '_');
            return `cat_${safeName}`;
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
