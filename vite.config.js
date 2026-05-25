import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'
import path from 'path'

// Custom Plugin: Automatically generates PWA icons from your existing logo!
function autoGeneratePWAIcons() {
  return {
    name: 'auto-generate-pwa-icons',
    buildStart() {
      const publicDir = path.resolve(process.cwd(), 'public');
      const dest192 = path.resolve(process.cwd(), 'public/pwa-192x192.png');
      const dest512 = path.resolve(process.cwd(), 'public/pwa-512x512.png');
      
      // Find your logo (checks both possible names you've used)
      let srcIcon = path.resolve(process.cwd(), 'src/assets/finalAlphafitIcon.png');
      if (!fs.existsSync(srcIcon)) {
        srcIcon = path.resolve(process.cwd(), 'src/assets/AlphaFitFULLLOGO-removebg.png');
      }

      // Magically copy and configure the files for the manifest
      if (fs.existsSync(srcIcon)) {
        if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
        fs.copyFileSync(srcIcon, dest192);
        fs.copyFileSync(srcIcon, dest512);
      }
    }
  }
}

export default defineConfig({
  plugins: [
    autoGeneratePWAIcons(),
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg', 'Alpha-intro.mp4', 'alpha-intro-audio.mp3'],
      manifest: {
        name: 'Alpha Fit Gym',
        short_name: 'Alpha Fit',
        description: 'Premium Gym Management & Workouts',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', // Forces fullscreen, hides browser URL bar!
        orientation: 'portrait',
        icons: [
          {
            src: '/pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,mp4,mp3}'],
        maximumFileSizeToCacheInBytes: 15000000, // 15MB limit to comfortably cache your cinematic intro media offline
        navigateFallback: '/index.html', // Fixes 404 routing refresh issues on installed PWAs
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\/api\/.*/i, // Caches your live backend API requests
            handler: 'NetworkFirst', // Tries the live database first, falls back to offline cache if no internet
            options: {
              cacheName: 'alphafit-api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // Keep offline data for up to 7 days
              },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: false } // Ensures stable production builds
    })
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
