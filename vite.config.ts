import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/CyberShield-Security-Monitor/',
  build: {
    rollupOptions: {
      input: {
        main: new URL('./index.html', import.meta.url).pathname,
        demoAuth: new URL('./demo-auth.html', import.meta.url).pathname,
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
