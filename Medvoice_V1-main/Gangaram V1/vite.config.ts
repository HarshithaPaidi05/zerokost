import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  publicDir: 'public',
  server: {
    proxy: {
      '/welcome.mp3': 'http://localhost:5000',
      '/test-sound.mp3': 'http://localhost:5000'
    }
  }
});