import FormFieldset from '@/components/Form/FormFieldset/FormFieldset'

export default {
  title: 'Components/Form/FormFieldset/FormFieldset',
  component: FormFieldset,
  args: {
    label: 'Name',
    required: true,
    icon: 'text-aa'
  },
  parameters: {
    slots: {
      default: {
        description: 'Default slot for inputs',
        template: `<input type="text" class="form-control" />`
      }
    }
  }
}

export const Default = {}
