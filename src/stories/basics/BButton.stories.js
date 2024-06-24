import { fn } from "@storybook/test";
import { BButton } from "bootstrap-vue-next";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories

export default {
  title: "Basics/BButton",
  component: BButton,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "select" }, options: ["sm", "md", "lg"] },
    variant: { control: { type: "select" }, options: ["primary", "secondary", "tertiary", "light"] },
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      BButton,
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      };
    },
    template: '<b-button v-bind="args" >{{args.label}}</b-button>',
  }),
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
};

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary = {
  args: {
    variant: "primary",
    size: "sm",
    label: "Button",
  },
};

export const Medium = {
  args: {
    variant: "primary",
    size: "md",
    label: "Button",
  },
};


export const Large = {
  args: {
    variant: "primary",
    size: "lg",
    label: "Button",
  },
};
