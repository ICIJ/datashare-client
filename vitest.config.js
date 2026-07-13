import { fileURLToPath } from 'node:url'
import { resolve } from 'path'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'

import viteConfig from './vite.config.js'

export default defineConfig(configEnv =>
  mergeConfig(
    viteConfig(configEnv),
    defineConfig({
      test: {
        globals: true,
        reporters: 'default',
        environment: 'jsdom',
        environmentOptions: {
          jsdom: {
            url: process.env.VITE_ES_HOST || 'http://localhost:9200'
          }
        },
        exclude: [...configDefaults.exclude, 'e2e/**'],
        server: {
          deps: {
            // Inline @icij/murmur so its per-component CSS imports are handled
            // by Vite's transform pipeline instead of Node's native loader.
            inline: ['@icij/murmur']
          }
        },
        deps: {
          optimizer: {
            ssr: {
              enabled: true,
              // Pre-bundle @icij/murmur with esbuild instead of transforming
              // its ~500 individual component/CSS files one by one.
              include: ['@icij/murmur']
            }
          }
        },
        root: fileURLToPath(new URL('./', import.meta.url)),
        setupFiles: [resolve(__dirname, 'tests/unit/setup.js')],
        pool: 'forks',
        poolOptions: {
          forks: {
            execArgv: ['--max-old-space-size=4096']
          }
        },
        testTimeout: 10000,
        maxWorkers: 1,
        minWorkers: 1
      }
    })
  )
)
