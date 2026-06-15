import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import basicSsl from "@vitejs/plugin-basic-ssl";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),basicSsl()],
  server: {
    host: process.env.VITE_HOST || 'localhost',
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
    cors: true,
  }
})
