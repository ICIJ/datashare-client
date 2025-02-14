import DisplayDatetimeRange from '@/components/Display/DisplayDatetimeRange'
import { FORMAT_SHORT } from '@/utils/humanDate'
import { dateFormatArgType } from '~storybook/utils'

export default {
  title: 'Components/Display/DisplayDatetimeRange',
  tags: ['autodocs'],
  component: DisplayDatetimeRange,
  argTypes: {
    format: dateFormatArgType
  },
  args: {
    value: [new Date('2017-05-07T00:00:00Z'), new Date('2024-05-07T00:00:00Z')],
    format: FORMAT_SHORT
  }
}

export const Default = {}
