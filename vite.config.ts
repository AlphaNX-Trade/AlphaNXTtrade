import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        includeAssets: [
          'favicon-32.png',
          'icon-*.png',
          'logo-full.png',
          'logo-mark.png',
          'robots.txt',
        ],
        manifest: {
          name: 'AlphaNXT - Paper Trading & Trading Education',
          short_name: 'AlphaNXT',
          description:
            'Premium paper trading and trading education terminal for India. Trade with virtual money, learn risk management, and get AI-powered coaching.',
          start_url: '/',
          id: '/',
          display: 'standalone',
          orientation: 'portrait',
          background_color: '#0B0F19',
          theme_color: '#0B0F19',
          categories: ['finance', 'education'],
          icons: [
            { src: '/icon-72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
            { src: '/icon-96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
            { src: '/icon-128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
            { src: '/icon-144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
            { src: '/icon-152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
            { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icon-384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
            { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
            { src: '/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
              },
            },
          ],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'wouter'],
            charts: ['recharts', 'lightweight-charts'],
            firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
            ui: ['framer-motion', 'lucide-react'],
          },
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true as const,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
