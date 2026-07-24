import globals from 'globals'
import icijeslint from '@icij/eslint-config'
import storybook from 'eslint-plugin-storybook'

export default [
  {
    ignores: [
      'public',
      'dist',
      'storybook-static',
      'coverage',
      // Ignore non-JS/Vue files that ESLint scans but can't lint
      '**/*.md',
      '**/*.mdx',
      '**/*.json',
      '**/*.yml',
      '**/*.yaml',
      '**/*.html',
      '**/*.scss',
      '**/*.css',
      '**/*.svg',
      '**/*.png',
      '**/*.hbs',
      '**/*.txt',
      '.env*',
      '.editorconfig',
      '.gitignore',
      'Makefile',
      'crowdin.yml',
    ]
  },

  // ICIJ ESLint shared config (includes Vue, TypeScript, Stylistic and Vitest)
  ...icijeslint.configs.all,

  // Storybook config
  ...storybook.configs['flat/recommended'],

  // Node scripts for common tasks and config files
  {
    files: ['bin/**/*.{cjs,mjs,js}', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      }
    }
  },

  // Storybook config, decorators and the render smoke script run in both the
  // browser (preview) and Node (the smoke harness) contexts.
  {
    files: ['.storybook/**/*.{js,mjs}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      }
    }
  },

  // Vitest are written for the browser and must include browser globals
  {
    files: [
      'src/**/*.{js,vue}',
      'tests/**/*.js',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
      }
    }
  },

  // Storybook stories reference icon components (`IPh*`) and `markRaw`, both
  // injected at build time by unplugin-auto-import (see vite.config.js). ESLint
  // can't see those build-time globals, and the icon names are resolved
  // dynamically so they can't be enumerated as globals. Genuinely undefined
  // identifiers are still caught at runtime by the render smoke test
  // (`yarn test-storybook`).
  {
    files: ['**/*.stories.{js,mjs,ts}'],
    rules: {
      'no-undef': 'off'
    }
  },

  // Specific rules for the project
  {
    languageOptions: {
      globals: {
        // Vite uses process.env for environment variables
        process: true
      }
    },
    rules: {
      // We use `require` with vite to make all components available for plugins.
      '@typescript-eslint/no-require-imports': 'off',
      // We use `v-html` in some components with vue i18n.
      'vue/no-v-html': 'off'
    }
  }
]
