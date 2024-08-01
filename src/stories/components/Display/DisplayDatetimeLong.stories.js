import DisplayDatetimeLong from '@/components/Display/DisplayDatetimeLong'

export default {
  title: 'Components/Display/DisplayDatetimeLong',
  tags: ['autodocs'],
  component: DisplayDatetimeLong,
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
