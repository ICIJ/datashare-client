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
    "storybook-addon-pseudo-states"
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
}

export default config