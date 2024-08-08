import FormStepHeadingToggler from '@/components/Form/FormStep/FormStepHeadingToggler'

export default {
  title: 'Components/Form/FormStep/FormStepHeadingToggler',
  component: FormStepHeadingToggler,
  args: {
    collapse: true
  },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      FormStepHeadingToggler
    },
    template: `
      <form-step-heading-toggler v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
