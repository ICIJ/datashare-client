import FormActions from '@/components/Form/FormActions/FormActions'
import ButtonIcon from '@/components//Button/ButtonIcon'

export default {
  title: 'Components/Form/FormActions/FormActions',
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
        'outline-primary',
        'outline-secondary',
        'outline-secondary',
        'outline-danger',
        'outline-info',
        'outline-success',
        'outline-warning',
        'outline-tertiary',
        'outline-dark',
        'outline-light'
      ]
    }
  },
  args: {
    size: 'md',
    variant: 'outline-secondary'
  },
  render(args) {
    return {
      components: { FormActions, ButtonIcon },
      template: `
        <form-actions v-bind="args">
          <button-icon icon-left="x">Cancel</button-icon>
          <button-icon icon-left="arrow-counter-clockwise">Reset</button-icon>
          <button-icon variant="action" icon-right="caret-right">Proceed</button-icon>
        </form-actions>
      `,
      data() {
        return { args }
      }
    }
  }
}

export const Default = {}
