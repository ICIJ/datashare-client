import Icon from '@/components/Icon.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories

export default {
  title: 'Basics/Icons',
  tags: ['autodocs'],
  component: Icon,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'body-color']
    }
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
      Icon
    },
    // The story's `args` need to be mapped into the template through the `setup()` method
    setup() {
      // Story args can be spread into the returned object
      return {
        args
      }
    },
    template: `
    Regular
    <br/>
    <Icon v-bind="args"/>
    <Icon v-bind="args" variant="primary"/>
    <Icon v-bind="args" variant="secondary"/>
    <Icon v-bind="args" variant="tertiary"/>

    <br/>
    Bold
    <br/>
    <Icon v-bind="args" weight="bold"/>
    <Icon v-bind="args" variant="primary" weight="bold"/>
    <Icon v-bind="args" variant="secondary" weight="bold"/>
    <Icon v-bind="args" variant="tertiary" weight="bold"/>
    <br/>
    Fill
    <br/>
    <Icon v-bind="args" weight="fill"/>
    <Icon v-bind="args" variant="primary" weight="fill"/>
    <Icon v-bind="args" variant="secondary" weight="fill"/>
    <Icon v-bind="args" variant="tertiary" weight="fill"/>
    <br/>
    Duotone
    <br/>
    <Icon v-bind="args" weight="duotone"/>
    <Icon v-bind="args" variant="primary" weight="duotone"/>
    <Icon v-bind="args" variant="secondary" weight="duotone"/>
    <Icon v-bind="args" variant="tertiary" weight="duotone"/>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {
    icon: 'User',
    size: '24'
  }
}

export const Larger = {
  args: {
    icon: 'User',
    size: '32'
  }
}
