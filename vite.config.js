import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import * as childProcess from 'child_process'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { PhosphorVuePreset } from './bin/presets'
import { PhosphorVueResolver } from './bin/resolvers'
import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

export default ({ mode }) => {
  const VITE_GIT_HASH = childProcess.execSync('git rev-parse HEAD').toString()
  const VITE_CWD = process.cwd()
  const ENV = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, { ...ENV, VITE_GIT_HASH, VITE_CWD })

  return defineConfig({
    base: process.env.VITE_BASE,
    plugins: [
      vue(),
      vueDevTools(),
      /**
       * The "Components" plugin resolvers imports automaticaly component in vue
       * templates For PhosphorVueResolver we use an homemade resolver
       * that simply imports icons (example: `<ph-plus>`).
       */
      Components({
        dts: false,
        dirs: [],
        resolvers: [
          BootstrapVueNextResolver(),
          PhosphorVueResolver()
        ]
      }),
      /**
       * The "AutoImport" plugin offer a mechanism simimar to the "Components" plugins
       * but it target javascript variable and references. This allows to imports component
       * directly in `<script setup>` or in vue template ref (example: `<component :is="PhPlus" />`)
       */
      AutoImport({
        dts: false,
        vueTemplate: true,
        imports: [
          PhosphorVuePreset()
        ],
        resolvers: [
          PhosphorVueResolver()
        ]
      })
    ],
    resolve: {
      dedupe: ['vue'],
      extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
      alias: {
        'path': 'path-browserify',
        'vue': resolve(__dirname, 'node_modules/vue/dist/vue.esm-bundler.js'),
        '@': resolve(__dirname, './src'),
        '~storybook': resolve('.storybook'),
        '~node_modules': resolve('node_modules'),
        '~mixins': resolve(__dirname, './src/mixins'),
        '~tests': resolve(__dirname, 'tests')
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          silenceDeprecations: ['legacy-js-api', 'import', 'mixed-decls', 'color-functions', 'function-units', 'global-builtin'],
          additionalData: `
            @use 'sass:math';
            @use 'sass:color';
            @import "@/utils/settings.scss";
          `
        },
        sass: { // https://github.com/twbs/bootstrap/issues/40962
          quietDeps: true,
        }
      }
    },
    server: {
      port: 9009,
      host: '0.0.0.0',
      watch: {
        usePolling: true
      },
      proxy: {
        '^/(version|settings|me|api).?': {
          target: process.env.VITE_DEV_PROXY,
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
}
