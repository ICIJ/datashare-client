import PathViewEntry from '@/components/PathView/PathViewEntry'

export default {
  title: 'Components/PathView/PathViewEntry',
  tags: ['autodocs'],
  component: PathViewEntry,
  args: {
    collapse: true,
    compact: false,
    selected: false,
    indeterminate: false,
    name: 'Contracts',
    selectMode: false,
    documents: ~~(2e2 * Math.random()),
    directories: ~~(2e2 * Math.random()),
    size: ~~(2e3 * Math.random())
  },
  render: (args) => ({
    components: {
      PathViewEntry
    },
    setup: () => ({ args }),
    template: `
      <path-view-entry v-bind="args"
        @update:selected="args.selected = $event"
        @update:indeterminate="args.indeterminate = $event"
        @update:collapse="args.collapse = $event" />
    `
  })
}

export const Default = {}
