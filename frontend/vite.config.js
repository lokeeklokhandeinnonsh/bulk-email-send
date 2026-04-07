import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://bulk-email-send-6v2r.onrender.com',
        changeOrigin: true
      }
    }
  }
});
