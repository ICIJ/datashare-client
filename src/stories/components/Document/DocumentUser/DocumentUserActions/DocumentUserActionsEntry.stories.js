import DocumentUserActionsEntry from '@/components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry'

export default {
  title: 'Components/Document/DocumentUser/DocumentUserActions/DocumentUserActionsEntry',
  tags: ['autodocs'],
  component: DocumentUserActionsEntry,
  args: {}
}

export const Default = {
  args: { icon: markRaw(IPhTag), label: '3 tags', value: '3' }
}

export const ShorterLabel = {
  args: { icon: markRaw(IPhTag), shorterLabel: true, hideTooltip: false, label: '3 tags', value: '3' }
}
