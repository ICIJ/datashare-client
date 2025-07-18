import remarkGfm from 'remark-gfm'
import { mergeConfig } from "vitest/config";


/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  core: {
    disableTelemetry: true
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  staticDirs: ['./static'],
  addons: [
    "@storybook/addon-links",
    '@storybook/addon-themes',
    'storybook-addon-vue-slots',
    "storybook-addon-pseudo-states",
    {
      name: '@storybook/addon-docs',
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: {
            remarkPlugins: [remarkGfm]
          }
        }
      }
    }
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
  //needed SB9 and storybook-vue3-router 5.0.0 compatibility  https://github.com/NickMcBurney/storybook-vue3-router/issues/68
  viteFinal: async (config) =>
    mergeConfig(config, {
      resolve: {
        alias: {
          // make every import of "@storybook/addon-actions"
          // resolve to the new package
          '@storybook/addon-actions': 'storybook/actions',
        },
      },
    }),
}

export default config
