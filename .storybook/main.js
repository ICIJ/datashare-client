import remarkGfm from 'remark-gfm'

/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  core: {
    disableTelemetry: true
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
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
}

export default config
