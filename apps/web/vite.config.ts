import path from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const __dirname = path.dirname(fileURLToPath(new URL(import.meta.url)))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // API fake (NestJS) — `npm run dev:api` na porta 4000
      '/api/v1': { target: 'http://localhost:4000', changeOrigin: true },
      '/api/openapi.json': { target: 'http://localhost:4000', changeOrigin: true },
      '/api': { target: 'http://localhost:4000', changeOrigin: true },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
})
