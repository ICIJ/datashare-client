import { BButton } from 'bootstrap-vue-next'

import PhosphorIcon from '@/components/PhosphorIcon'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories

export default {
  title: 'Components/Button/IconButtons',
  component: PhosphorIcon,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary', 'light'] }
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      BButton,
      PhosphorIcon
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
      <b-button v-bind="args" ><phosphor-icon name="CirclesThreePlus" />{{args.label}}</b-button>
    `
  }),
  parameters: {
    pseudo: {
      hover: ['#hover'],
      focus: ['#focus'],
      active: ['#active']
    }
  }
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const IconLeft = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Button'
  }
}
