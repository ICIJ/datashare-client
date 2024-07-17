import DatetimeDisplay from '@/components/DatetimeDisplay/DatetimeDisplay'

import { FORMAT_SHORT, FORMAT_LONG, FORMAT_FROM_NOW } from '@/utils/humanDate'

export default {
  title: 'Components/DatetimeDisplay',
  tags: ['autodocs'],
  component: DatetimeDisplay,
  argTypes: {
    value: {
      control: 'date'
    },
    format: {
      control: 'select',
      options: [FORMAT_SHORT, FORMAT_LONG, FORMAT_FROM_NOW]
    }
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
