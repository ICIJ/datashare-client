import FormStepContent from '@/components/Form/FormStep/FormStepContent'

export default {
  title: 'Components/Form/FormStep/FormStepContent',
  component: FormStepContent,
  args: {
    default: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    collapse: false
  },
  parameters: {
    slots: {
      default: `Default slot content`
    }
  }
}

export const Default = {}
