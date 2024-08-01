import DisplayDatetimeRange from '@/components/Display/DisplayDatetimeRange'
import { FORMAT_SHORT, FORMAT_LONG, FORMAT_FROM_NOW } from '@/utils/humanDate'

export default {
  title: 'Components/Display/DisplayDatetimeRange',
  tags: ['autodocs'],
  component: DisplayDatetimeRange,
  argTypes: {
    format: {
      control: 'select',
      options: [FORMAT_SHORT, FORMAT_LONG, FORMAT_FROM_NOW]
    }
  },
  args: {
    value: [new Date('2017-05-07T00:00:00Z'), new Date('2024-05-07T00:00:00Z')],
    format: FORMAT_SHORT
  }
}

export const Default = {}
