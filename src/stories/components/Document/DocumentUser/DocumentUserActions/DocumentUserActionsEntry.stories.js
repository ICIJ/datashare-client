import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry',
  tags: ['autodocs'],
  component: DocumentUserActionsEntry,
  args: {}
}

export const Default = {
  args: { icon: 'tag', label: '3 tags', value: '3' }
}

export const ShorterLabel = {
  args: { icon: 'tag', shorterLabel: true, hideTooltip: false, label: '3 tags', value: '3' }
}
