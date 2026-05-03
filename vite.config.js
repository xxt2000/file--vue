import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://101.200.150.27:3000',
        changeOrigin: true,
        rewrite: (path) => path  // 不要重写路径
      },
      '/uploads': {
        target: 'http://101.200.150.27:3000',
        changeOrigin: true,
      }
    }
  }
})