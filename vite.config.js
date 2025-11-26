import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // <-- 1. IMPORT THE PLUGIN

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // 2. ADD THE PLUGIN WITH CONFIGURATION
    VitePWA({
      registerType: 'autoUpdate', // Automatically updates the app
      
      // 3. CONFIGURE THE WEB APP MANIFEST
      manifest: {
        name: 'TerraTalk',
        short_name: 'TerraTalk',
        description: 'Voice-Enabled Geospatial Map Application',
        theme_color: '#3367D6', // You can change this color
        background_color: '#FFFFFF',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png', // <-- Uses the icon from /public
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/icon-512x512.png', // <-- Uses the icon from /public
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },

      // 4. ADDED THIS BLOCK TO FIX THE BUILD ERROR
      workbox: {
        // Increases the file size limit for caching to 3MB (3,000,000 bytes)
        maximumFileSizeToCacheInBytes: 3000000 
      }
    })
  ]
})