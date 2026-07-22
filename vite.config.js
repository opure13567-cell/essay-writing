import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ['defaults', 'chrome >= 50', 'ios >= 10', 'Android >= 5'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime'],
    }),
  ],
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
