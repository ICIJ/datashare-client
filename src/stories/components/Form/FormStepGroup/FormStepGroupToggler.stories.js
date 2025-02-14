import FormStepGroupToggler from '@/components/Form/FormStepGroup/FormStepGroupToggler'

export default {
  title: 'Components/Form/FormStepGroup/FormStepGroupToggler',
  component: FormStepGroupToggler,
  args: {
    collapse: true
  },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      FormStepGroupToggler
    },
    template: `
      <form-step-group-toggler v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
