import DisplayStatusProgress from '@/components/Display/DisplayStatusProgress'

export default {
  title: 'Components/Display/DisplayStatusProgress',
  tags: ['autodocs'],
  component: DisplayStatusProgress,
  argTypes: {
    fixedWidth: {
      control: 'boolean'
    },
    status: {
      control: 'select',
      options: ['queued', 'success', 'failure', 'draft']
    },
    statusVariant: {
      control: { type: 'select', required: false },
      options: ['action', 'primary', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
    },
    progress: {
      control: { type: 'number', min: 0, max: 1, step: 0.1 }
    },
    progressVariant: {
      control: { type: 'select', required: false },
      options: ['action', 'primary', 'secondary', 'tertiary', 'success', 'danger', 'warning', 'info', 'light', 'dark']
    }
  },
  args: {
    fixedWidth: true,
    status: 'queued',
    statusVariant: undefined,
    statusIcon: undefined,
    statusTitle: undefined,
    progress: 0.5,
    progressVariant: undefined,
  }
}

export const Default = {}
