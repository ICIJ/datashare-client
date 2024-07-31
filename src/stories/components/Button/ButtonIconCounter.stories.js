import ButtonIconCounter from '@/components/Button/ButtonIconCounter'

export default {
  components: { ButtonIconCounter },
  title: 'Components/Button/ButtonIconCounter',
  component: ButtonIconCounter,
  tags: ['autodocs'],
  argTypes: {
    counter: {
      control: { type: 'number' }
    },
    variant: {
      control: { type: 'select' },
      options: [
        'action',
        'primary',
        'secondary',
        'success',
        'danger',
        'warning',
        'info',
        'light',
        'dark',
        'outline-action',
        'outline-primary',
        'outline-secondary',
        'outline-success',
        'outline-danger',
        'outline-warning',
        'outline-info',
        'outline-light',
        'outline-dark'
      ]
    }
  },
  args: {
    variant: 'secondary',
    counter: 123
  }
}

export const Default = {}
