import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/sucursal-weblogic-3d/',
  plugins: [react()],
  server: {
    host: true,
    watch: { usePolling: true },
  },
})
