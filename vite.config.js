import { defineConfig } from 'vite';
export default defineConfig({
  server: { host: '127.0.0.1', proxy: { '/api/local-dialogue': 'http://127.0.0.1:8788', '/api': 'http://127.0.0.1:8787' } },
  preview: { host: '127.0.0.1' },
  build: { target: 'es2022' }
});
