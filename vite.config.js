import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2015',
    cssTarget: 'chrome61',
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
