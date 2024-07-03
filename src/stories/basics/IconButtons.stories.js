import IconButton from '@/components/IconButton.vue'

export default {
  components: { IconButton },
  title: 'Components/Button/IconButtons',
  component: IconButton,
  tags: ['autodocs'],
  argTypes: {
    size: { control: { type: 'select' }, options: ['sm', 'md', 'lg'] },
    variant: { control: { type: 'select' }, options: ['primary', 'secondary', 'tertiary', 'light'] }
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      IconButton
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
      <IconButton v-bind="args" >{{args.label}}</IconButton>
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
    label: 'Button',
    iconLeft: 'CirclesThreePlus'
  }
}
export const IconBothSide = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Save search',
    iconLeft: 'CirclesThreePlus',
    iconRight: 'users'
  }
}
export const IconRight = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Button',
    iconRight: 'users'
  }
}
export const NoLabel = {
  args: {
    variant: 'primary',
    size: 'md',
    label: 'Button',
    hideLabel: true,
    iconRight: 'users'
  }
}
