import PageTableTh from '@/components/PageTable/PageTableTh'

export default {
  title: 'Components/PageTable/PageTableTh',
  tags: ['autodocs'],
  component: PageTableTh,
  argTypes: {
    order: {
      control: 'select',
      options: ['asc', 'desc']
    }
  },
  args: {
    label: 'Name of the column',
    icon: 'circles-three-plus',
    sortable: true,
    sorted: true,
    order: 'desc'
  },
  render: (args) => ({
    components: {
      PageTableTh
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <page-table-th v-bind="args" @update:order="args.order = $event" @update:sorted="args.sorted = $event" />
    `
  })
}

export const Default = {}
