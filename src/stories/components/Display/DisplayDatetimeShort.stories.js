import DisplayDatetimeShort from '@/components/Display/DisplayDatetimeShort'

export default {
  title: 'Components/Display/DisplayDatetimeShort',
  tags: ['autodocs'],
  component: DisplayDatetimeShort,
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
