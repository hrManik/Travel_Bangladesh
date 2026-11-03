import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { socialSharePages } from './scripts/socialSharePages.ts';

export default defineConfig(() => {
  return {
    base: '/Travel_Bangladesh/',

    plugins: [react(), tailwindcss(), socialSharePages('/Travel_Bangladesh/')],

    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },

    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});