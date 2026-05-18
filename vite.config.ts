import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // Use the `sass` package (JS API), not `sass-embedded` native binary.
        api: 'modern',
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://172.18.18.190:8330/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  resolve: {
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@sys/styles': fileURLToPath(new URL('./src/assets/style', import.meta.url)),
    },
  },
})
