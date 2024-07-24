import DisplayStatus from '@/components/Display/DisplayStatus'

export default {
  title: 'Components/Display/DisplayStatus',
  tags: ['autodocs'],
  component: DisplayStatus,
  argTypes: {
    value: {
      control: 'select',
      options: ['queued', 'success', 'failure', 'draft']
    }
  },
  args: {
    value: 'success'
  }
}

export const Default = {}
