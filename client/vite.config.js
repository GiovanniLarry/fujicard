import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      /.+\.ngrok-free\.app$/,
      'ce4d-129-0-76-161.ngrok-free.app',
      '19cd-129-0-76-161.ngrok-free.app',
      'twenty-mugs-find.loca.lt'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
