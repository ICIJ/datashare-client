import { defineConfig, loadEnv } from 'vite'
import { resolve } from 'path'
import * as childProcess from 'child_process'
import Components from 'unplugin-vue-components/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import { BootstrapVueNextResolver } from 'unplugin-vue-components/resolvers'

export default ({ mode }) => {
  const VITE_GIT_HASH = childProcess.execSync('git rev-parse HEAD').toString()
  const VITE_CWD = process.cwd()
  const ENV = loadEnv(mode, process.cwd(), '')
  Object.assign(process.env, { ...ENV, VITE_GIT_HASH, VITE_CWD })

  // Disable vueDevTools in Storybook (causes "environment context" error with vite-plugin-inspect)
  // https://github.com/storybookjs/storybook/issues/32462
  const isStorybook = process.argv[1]?.includes('storybook')

  // Single source of truth for the Phosphor icon resolver, shared by the
  // Components plugin (`<i-ph-*>` in SFC templates) and AutoImport (`IPh*`
  // identifiers in stories) so the prefix/collection can't drift between them.
  const iconsResolver = IconsResolver({ prefix: 'i', enabledCollections: ['ph'] })

  return defineConfig({
    base: process.env.VITE_BASE,
    plugins: [
      vue(),
      !isStorybook && vueDevTools(),
      /**
       * The "Icons" plugin generates icon components from Iconify collections.
       * Icons are used via <i-{collection}-{icon}> syntax (e.g., <i-ph-user />).
       */
      Icons({
        scale: 1,
        compiler: 'vue3',
        autoInstall: true
      }),
      /**
       * The "Components" plugin resolvers imports automaticaly component in vue
       * templates. IconsResolver handles <i-ph-*> icon components.
       */
      Components({
        dts: false,
        dirs: [],
        resolvers: [
          BootstrapVueNextResolver(),
          iconsResolver
        ]
      }),
      /**
       * The "AutoImport" plugin offer a mechanism similar to the "Components" plugins
       * but it targets javascript variables and references.
       */
      AutoImport({
        dts: false,
        vueTemplate: true,
        /**
         * Scoped to Storybook stories only: auto-import `~icons/ph/*` components
         * referenced by their PascalCase name (e.g. `IPhRocketLaunch`) plus
         * `markRaw`, so stories pass an icon component to `icon` props without an
         * import line — mirroring how SFC templates use `<i-ph-*>`. The rest of the
         * app keeps its explicit-import convention (and `no-undef` coverage); only
         * stories opt into this magic. `markRaw` avoids Vue's reactive-component
         * warning when an icon is passed as a Storybook arg.
         */
        include: [/\.stories\.[jt]sx?$/],
        imports: [{ vue: ['markRaw'] }],
        resolvers: [iconsResolver]
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
          silenceDeprecations: ['legacy-js-api', 'import', 'color-functions', 'function-units', 'global-builtin', 'if-function'],
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
        '^/(version|settings|me|api|auth).?': {
          target: process.env.VITE_DEV_PROXY,
          changeOrigin: true,
          secure: false
        }
      }
    }
  })
}
