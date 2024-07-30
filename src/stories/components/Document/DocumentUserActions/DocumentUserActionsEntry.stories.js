import DocumentUserActionsEntry from '@/components/Document/DocumentUserActions/DocumentUserActionsEntry'

export default {
  title: 'Components/Document/DocumentUserActions/DocumentUserActionsEntry',
  tags: ['autodocs'],
  component: DocumentUserActionsEntry,
  args: {}
}

export const Default = {
  args: { icon: 'tag', label: '3 tags', value: '3' }
}
export const Compact = {
  args: { icon: 'tag', compact: true, label: '3 tags', value: '3' }
}
