import { defineConfig } from 'vite';
export default defineConfig({
  server: { host: '127.0.0.1', proxy: { '/api': 'http://localhost:8787' } },
  preview: { host: '127.0.0.1' },
  build: { target: 'es2022' }
});
