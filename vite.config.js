import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vercel & local dev serve from root ('/'); the GitHub Pages build sets
// DEPLOY_TARGET=pages to use the '/pixelrex/' sub-path.
export default defineConfig(() => ({
  base: process.env.DEPLOY_TARGET === 'pages' ? '/pixelrex/' : '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
}))
