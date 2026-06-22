import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  optimizeDeps: {
    exclude: ['lucide-react', '@capacitor/core', '@capacitor/app'],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
