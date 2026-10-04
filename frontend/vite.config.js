import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 後端 (gin) 沒有開 CORS,開發時透過 proxy 轉發 /v1 到後端
const target = process.env.VITE_API_TARGET || 'http://127.0.0.1:8888'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/v1': { target, changeOrigin: true }
    }
  }
})
