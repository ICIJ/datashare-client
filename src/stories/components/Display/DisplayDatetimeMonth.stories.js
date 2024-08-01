import DisplayDatetimeMonth from '@/components/Display/DisplayDatetimeMonth'

export default {
  title: 'Components/Display/DisplayDatetimeMonth',
  tags: ['autodocs'],
  component: DisplayDatetimeMonth,
  argTypes: {
    value: {
      control: 'date'
    }
  },
  args: {
    value: new Date(1494115200000)
  }
}

export const Default = {}
