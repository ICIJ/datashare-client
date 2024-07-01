/** @type { import('@storybook/vue3-vite').StorybookConfig } */
const config = {
  core: {
    disableTelemetry: true // 👈 Disables telemetry
  },
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    '@storybook/addon-themes',
  ],
  framework: {
    name: "@storybook/vue3-vite",
    options: {},
  },
};
export default config;
