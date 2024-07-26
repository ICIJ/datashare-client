import PathViewEntryName from '@/components/PathView/PathViewEntryName'

export default {
  title: 'Components/PathView/PathViewEntryName',
  tags: ['autodocs'],
  component: PathViewEntryName,
  args: {
    collapse: true,
    name: 'Contracts',
    selectMode: false
  },
  render: (args) => ({
    components: {
      PathViewEntryName
    },
    setup: () => ({ args }),
    template: `
      <path-view-entry-name v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
