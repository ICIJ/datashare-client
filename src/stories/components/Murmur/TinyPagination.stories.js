import { TinyPagination } from '@icij/murmur-next'

import { buttonSizesArgType } from '~storybook/utils'
import { SIZE } from '@/enums/sizes'

export default {
  title: 'Components/Murmur/TinyPagination',
  component: TinyPagination,
  tags: ['autodocs'],
  argTypes: {
    size: buttonSizesArgType,
    pages: {
      control: 'number',
      min: 0
    },
    row: {
      type: 'boolean'
    }
  }
}
const Template = (args) => ({
  components: { TinyPagination },
  setup() {
    return { args }
  },
  template: '<tiny-pagination v-bind="args" />'
})

export const Default = Template.bind({})
Default.args = {
  modelValue: 1,
  totalRows: 200
}

export const Small = Template.bind({})
Small.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  size: SIZE.SM
}

export const Medium = Template.bind({})
Medium.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  size: SIZE.MD
}

export const Large = Template.bind({})
Large.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  size: SIZE.LG
}

export const HideNavigation = Template.bind({})
HideNavigation.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  noNav: true
}

export const CompactMode = Template.bind({})
CompactMode.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  compact: true
}

export const RowMode = Template.bind({})
RowMode.args = {
  modelValue: 1,
  perPage: 25,
  totalRows: 2e6,
  compact: false,
  row: true
}

export const UniqueRowMode = Template.bind({})
UniqueRowMode.args = {
  modelValue: 1,
  perPage: 1,
  totalRows: 2e6,
  compact: false,
  row: true
}

export const CompactRowMode = Template.bind({})
CompactRowMode.args = {
  modelValue: 1,
  perPage: 25,
  totalRows: 2e6,
  compact: true,
  row: true
}

export const RowModeZero = Template.bind({})
RowModeZero.args = {
  modelValue: 1,
  perPage: 25,
  totalRows: 0,
  compact: false,
  row: true
}
