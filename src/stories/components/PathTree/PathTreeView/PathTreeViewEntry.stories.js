import PathTreeViewEntry from '@/components/PathTree/PathTreeView/PathTreeViewEntry'

export default {
  title: 'Components/PathTree/PathTreeView/PathTreeViewEntry',
  tags: ['autodocs'],
  component: PathTreeViewEntry,
  args: {
    collapse: true,
    nested: true,
    compact: false,
    selected: false,
    indeterminate: false,
    name: 'Contracts',
    selectMode: false,
    documents: ~~(2e2 * Math.random()),
    directories: ~~(2e2 * Math.random()),
    size: ~~(2e3 * Math.random())
  },
  render: args => ({
    components: {
      PathTreeViewEntry
    },
    setup: () => ({ args }),
    template: `
      <path-tree-view-entry v-bind="args"
        @update:selected="args.selected = $event"
        @update:indeterminate="args.indeterminate = $event"
        @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
