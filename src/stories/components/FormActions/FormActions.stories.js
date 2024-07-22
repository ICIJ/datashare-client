import FormActions from '@/components/FormActions/FormActions'
import IconButton from '@/components//IconButton'

export default {
  title: 'Components/FormActions/FormActions',
  tags: ['autodocs'],
  component: FormActions,
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    variant: {
      control: 'select',
      options: [
        'primary',
        'secondary',
        'tertiary',
        'danger',
        'info',
        'success',
        'warning',
        'light',
        'dark',
        'lighter',
        'darker',
        'outline-primary',
        'outline-secondary',
        'outline-tertiary',
        'outline-danger',
        'outline-info',
        'outline-success',
        'outline-warning',
        'outline-light',
        'outline-dark',
        'outline-lighter',
        'outline-darker'
      ]
    }
  },
  args: {
    size: 'md',
    variant: 'outline-tertiary'
  },
  render(args) {
    return {
      components: { FormActions, IconButton },
      template: `
        <form-actions v-bind="args">
          <icon-button icon-left="x">Cancel</icon-button>
          <icon-button icon-left="arrow-counter-clockwise">Reset</icon-button>
          <icon-button variant="primary" icon-right="caret-right">Proceed</icon-button>
        </form-actions>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}
