import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { FORMAT_LONG } from '@/utils/humanDate'
import { dateFormatArgType } from '~storybook/utils'

export default {
  title: 'Components/Display/DisplayDatetime',
  tags: ['autodocs'],
  component: DisplayDatetime,
  argTypes: {
    value: {
      control: 'date'
    },
    format: dateFormatArgType
  },
  args: {
    value: new Date(),
    format: FORMAT_LONG
  }
}

export const Default = {}

export const WithString = {
  args: {
    value: '2021-01-01T00:00:00Z'
  }
}

export const WithNumber = {
  args: {
    value: 160945920000
  }
}
