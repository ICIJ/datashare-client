import FormStepHeadingIndex from '@/components/Form/FormStep/FormStepHeadingIndex'

export default {
  title: 'Components/Form/FormStep/FormStepHeadingIndex',
  component: FormStepHeadingIndex,
  args: {
    collapse: true,
    index: 1
  },
  render: (args) => ({
    setup: () => ({ args }),
    components: {
      FormStepHeadingIndex
    },
    template: `
      <form-step-heading-index v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
