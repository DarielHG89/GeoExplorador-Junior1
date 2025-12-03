import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Esto es crucial para GitHub Pages. './' hace que los enlaces sean relativos
  base: './', 
})