import DisplayProgress from '@/components/Display/DisplayProgress'

export default {
  title: 'Components/Display/DisplayProgress',
  tags: ['autodocs'],
  component: DisplayProgress,
  argTypes: {
    value: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 }
    },
    variant: {
      control: { type: 'select' },
      options: ['action', 'primary', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
    }
  },
  args: {
    value: 0.5,
    variant: 'primary'
  }
}

export const Default = {}
