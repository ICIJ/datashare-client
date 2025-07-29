import PathTreeViewEntryNameCheckbox from '@/components/PathTree/PathTreeView/PathTreeViewEntryNameCheckbox'

export default {
  title: 'Components/PathTree/PathTreeView/PathTreeViewEntryNameCheckbox',
  tags: ['autodocs'],
  component: PathTreeViewEntryNameCheckbox,
  args: {
    indeterminate: false,
    modelValue: false,
    disabled: false
  },
  render: args => ({
    components: {
      PathTreeViewEntryNameCheckbox
    },
    setup: () => ({ args }),
    template: `
      <path-tree-view-entry-name-checkbox v-bind="args" @update:indeterminate="args.indeterminate = $event" />
    `
  })
}

export const Default = {}
