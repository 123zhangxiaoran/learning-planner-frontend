import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// 移除 Pinia 控制台日志的插件
const removePiniaConsolePlugin = () => {
  return {
    name: 'remove-pinia-console',
    apply: 'serve',
    transformIndexHtml() {
      return [
        {
          tag: 'script',
          children: `
            (function() {
              const originalConsole = { ...console };
              ['log', 'info', 'warn', 'error'].forEach(method => {
                console[method] = (...args) => {
                  if (args[0] && typeof args[0] === 'string' && args[0].includes('🍍')) {
                    return;
                  }
                  originalConsole[method](...args);
                };
              });
            })();
          `,
        },
      ]
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8820'

  return {
    plugins: [vue(), vueDevTools(), removePiniaConsolePlugin()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 5173,
      proxy: {
        '/api': {
          target: apiBaseUrl,
          changeOrigin: true,
          cookieDomainRewrite: '',
        },
      },
    },
  }
})
