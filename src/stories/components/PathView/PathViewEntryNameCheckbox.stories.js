import PathViewEntryNameCheckbox from '@/components/PathView/PathViewEntryNameCheckbox'

export default {
  title: 'Components/PathView/PathViewEntryNameCheckbox',
  tags: ['autodocs'],
  component: PathViewEntryNameCheckbox,
  args: {
    indeterminate: false,
    modelValue: false,
    disabled: false
  },
  render: (args) => ({
    components: {
      PathViewEntryNameCheckbox
    },
    setup: () => ({ args }),
    template: `
      <path-view-entry-name-checkbox v-bind="args" @update:indeterminate="args.indeterminate = $event" />
    `
  })
}

export const Default = {}
