import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import Components from 'unplugin-vue-components/vite'
import vue from '@vitejs/plugin-vue'

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''))

  return defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            compatConfig: {
              MODE: 2,
              COMPONENT_V_MODEL: false,
              WATCH_ARRAY: false
            }
          }
        }
      }),
      Components({
        resolvers: [BootstrapVueNextResolver()]
      })
    ],
    test: {
      globals: true,
      reporters: 'basic',
      environment: 'jsdom',
      setupFiles: [resolve(__dirname, 'tests/unit/setup.js')]
    },
    resolve: {
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        path: 'path-browserify',
        vue: '@vue/compat',
        '@': resolve(__dirname, './src'),
        '~node_modules': resolve('node_modules'),
        '~mixins': resolve(__dirname, './src/mixins'),
        '~tests': resolve(__dirname, 'tests')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use 'sass:math';
            @import "@/utils/settings.scss";
          `
        }
      }
    },
    server: {
      port: 9009,
      host: '0.0.0.0',
      proxy: {
        '^/(settings|me|api).?': {
          target: process.env.VITE_DEV_PROXY,
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
}
