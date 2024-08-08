import FormStepHeading from '@/components/Form/FormStep/FormStepHeading'

export default {
  title: 'Components/Form/FormStep/FormStepHeading',
  component: FormStepHeading,
  args: {
    title: 'Name, project(s) and description',
    index: 1,
    collapse: false
  },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      FormStepHeading
    },
    template: `
      <form-step-heading v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
