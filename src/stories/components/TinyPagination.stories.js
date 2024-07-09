import { TinyPagination } from '@icij/murmur-next'

export default {
  title: 'components/TinyPagination',
  component: TinyPagination,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'inline-radio',
      options: ['sm', 'md', 'lg']
    },
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
  size: 'sm'
}

export const Medium = Template.bind({})
Medium.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  size: 'md'
}

export const Large = Template.bind({})
Large.args = {
  modelValue: 1,
  perPage: 10,
  totalRows: 200,
  size: 'lg'
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
