import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// محاولة قراءة شهادات SSL إذا كانت موجودة
const certDir = path.resolve(__dirname, 'certificates')
let https: any = false

if (fs.existsSync(certDir)) {
  const certPath = path.join(certDir, 'localhost+1.pem')
  const keyPath = path.join(certDir, 'localhost+1-key.pem')
  
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    https = {
      cert: fs.readFileSync(certPath),
      key: fs.readFileSync(keyPath)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    https,
    // للسماح بالوصول من أجهزة أخرى على الشبكة
    host: process.env.VITE_HOST || 'localhost',
    port: process.env.VITE_PORT ? parseInt(process.env.VITE_PORT) : 5173,
    cors: true,
  }
})
