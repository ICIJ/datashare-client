import DisplayDatetimeFromNow from '@/components/Display/DisplayDatetimeFromNow'

export default {
  title: 'Components/Display/DisplayDatetimeFromNow',
  tags: ['autodocs'],
  component: DisplayDatetimeFromNow,
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
