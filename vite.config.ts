import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages, set base: '/<repo-name>/'
  base: './',
  build: {
    outDir: 'dist',
  },
  assetsInclude: ['**/*.txt'],
})
