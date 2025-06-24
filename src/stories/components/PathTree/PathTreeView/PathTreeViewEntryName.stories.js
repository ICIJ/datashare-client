import PathTreeViewEntryName from '@/components/PathTree/PathTreeView/PathTreeViewEntryName'

export default {
  title: 'Components/PathTree/PathTreeView/PathTreeViewEntryName',
  tags: ['autodocs'],
  component: PathTreeViewEntryName,
  args: {
    collapse: true,
    nested: true,
    name: 'Contracts',
    selectMode: false
  },
  render: (args) => ({
    components: {
      PathTreeViewEntryName
    },
    setup: () => ({ args }),
    template: `
      <path-tree-view-entry-name v-bind="args" @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
