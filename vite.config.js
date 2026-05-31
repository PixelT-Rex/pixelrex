import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base '/pixelrex/' for the GitHub Pages build; '/' for local dev.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pixelrex/' : '/',
  plugins: [react()],
  server: { host: true, port: 5173 },
}))
