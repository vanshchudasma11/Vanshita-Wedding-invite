import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    // Required for React Router: serve index.html for all routes
    historyApiFallback: true,
  },
});
