import FormStep from '@/components/Form/FormStep/FormStep'

export default {
  title: 'Components/Form/FormStep/FormStep',
  component: FormStep,
  args: {
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    title: 'Name, project(s) and description',
    index: 1,
    collapse: false
  },
  parameters: {
    slots: {
      default: `Default slot content`
    }
  },
  render: args => ({
    setup: () => ({ args }),
    components: {
      FormStep
    },
    template: `
      <form-step v-bind="args" @update:collapse="args.collapse = $event">
        {{ args.default }}
      </form-step>
    `
  })
}

export const Default = {}
