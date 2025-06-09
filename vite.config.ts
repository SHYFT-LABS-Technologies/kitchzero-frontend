import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react({
      // Add React plugin options for better HMR
      fastRefresh: true,
      babel: {
        plugins: []
      }
    }),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
    },
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})