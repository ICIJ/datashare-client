import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue2'

export default ({ mode }) => {
  process.env = Object.assign(process.env, loadEnv(mode, process.cwd(), ''));

  return defineConfig({
    plugins: [vue()],
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
        vue: 'vue/dist/vue.esm.js',
        '@': resolve(__dirname, './src'),
        '~images': resolve(__dirname, './src/assets/images'),
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
        '/': process.env.VITE_DEV_PROXY,
      },
    }
  })
}
