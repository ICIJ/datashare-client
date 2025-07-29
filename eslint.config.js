import globals from 'globals'
import icijeslint from '@icij/eslint-config'
import storybook from 'eslint-plugin-storybook'

import { globals as iconsGlobals } from './bin/icons.js'

export default [
  {
    ignores: ['public', '.storybook']
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
        process: true
      }
    },
    rules: {
      // Legacy rules, might not be needed anymore
      // "vue/no-v-model-argument": "off",
      // "vue/no-v-for-template-key": "off",
      // "vue/no-custom-modifiers-on-v-model": "off",
      // "vue/no-multiple-template-root": "off",
      'vue/valid-v-slot': 'off',
      // We use `require` with vite to make all components available for plugins.
      // We might want to refactor this in the future with eslint comments.
      '@typescript-eslint/no-require-imports': 'off',
      // We use `v-html` in some components with vue i18n.
      // We might want to refactor this in the future with eslint comments.
      'vue/no-v-html': 'off'
    }
  }
]
