import PhosphorIcon from '@/components/PhosphorIcon'

export default {
  title: 'Components/PhosphorIcon',
  component: PhosphorIcon,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'tertiary', 'body-color']
    }
  },
  render: (args) => ({
    // Components used in your story `template` are defined in the `components` object
    components: {
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
    Regular
    <br/>
    <phosphor-icon v-bind="args"/>
    <phosphor-icon v-bind="args" variant="primary"/>
    <phosphor-icon v-bind="args" variant="secondary"/>
    <phosphor-icon v-bind="args" variant="tertiary"/>

    <br/>
    Bold
    <br/>
    <phosphor-icon v-bind="args" weight="bold"/>
    <phosphor-icon v-bind="args" variant="primary" weight="bold"/>
    <phosphor-icon v-bind="args" variant="secondary" weight="bold"/>
    <phosphor-icon v-bind="args" variant="tertiary" weight="bold"/>
    <br/>
    Fill
    <br/>
    <phosphor-icon v-bind="args" weight="fill"/>
    <phosphor-icon v-bind="args" variant="primary" weight="fill"/>
    <phosphor-icon v-bind="args" variant="secondary" weight="fill"/>
    <phosphor-icon v-bind="args" variant="tertiary" weight="fill"/>
    <br/>
    Duotone
    <br/>
    <phosphor-icon v-bind="args" weight="duotone"/>
    <phosphor-icon v-bind="args" variant="primary" weight="duotone"/>
    <phosphor-icon v-bind="args" variant="secondary" weight="duotone"/>
    <phosphor-icon v-bind="args" variant="tertiary" weight="duotone"/>
    `
  })
}

// // More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default = {
  args: {
    name: 'User',
    size: '24'
  }
}

export const Larger = {
  args: {
    name: 'User',
    size: '32'
  }
}
