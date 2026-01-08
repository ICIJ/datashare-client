import globals from 'globals'
import icijeslint from '@icij/eslint-config'
import storybook from 'eslint-plugin-storybook'

import { globals as iconsGlobals } from './bin/icons.js'

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

  // Specific rules for the project
  {
    languageOptions: {
      globals: {
        ...iconsGlobals,
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
