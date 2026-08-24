import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // This allows your specific ngrok URL:
    allowedHosts: ['morse-trustless-speed.ngrok-free.dev', 'atlas-grandma-portable.ngrok-free.dev'],

  }
})