import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type UserConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        silenceDeprecations: ['legacy-js-api', 'import'],
        // @ts-expect-error sass modern compiler API (valid at runtime)
        api: 'modern',
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
    dedupe: ['vue', 'vue-router', 'pinia', 'element-plus', '@vue/runtime-core'],
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@sys/styles': fileURLToPath(new URL('./src/assets/style', import.meta.url)),
    },
  },
})
