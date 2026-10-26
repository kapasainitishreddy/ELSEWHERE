import { defineConfig } from 'vite';
export default defineConfig({
  server: { host: '0.0.0.0', proxy: { '/api': 'http://localhost:8787' } },
  preview: { host: '0.0.0.0' },
  build: { target: 'es2022' }
});
