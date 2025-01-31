
import vitest from "eslint-plugin-vitest"
import vitestGlobals from "eslint-plugin-vitest-globals"
import storybook from 'eslint-plugin-storybook'

import compat from "./bin/eslint/compat.js"
import { globals as iconsGlobals } from "./bin/icons.js"

export default [
  {
    ignores: [
      "dist",
      "**/*.config.js",
      "**/config.yml",
      "public",
      "node_modules",
      "storybook-static",
      ".storybook"
    ]
  },
  ...compat.extends("@icij/eslint-config-icij"),
  ...storybook.configs['flat/recommended'],
  {
    files: ["tests/**"],
    languageOptions: {
      globals: vitestGlobals.environments.env.globals,
    },
     ...vitest.configs.recommended,
  },
  {
    languageOptions: {
      globals: {
        ...iconsGlobals,
      }
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^(Ph[A-Z])|(_)" }],
      "vue/no-v-model-argument": "off",
      "vue/no-v-for-template-key": "off",
      "vue/no-custom-modifiers-on-v-model": "off",
      "vue/no-multiple-template-root": "off",
      "vue/valid-v-slot": "off",
      "import/extensions": "off",
    }
  }
]
