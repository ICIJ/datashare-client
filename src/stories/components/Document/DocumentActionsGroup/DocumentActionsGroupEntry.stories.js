import DocumentActionsGroupEntry from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntry'

export default {
  components: { DocumentActionsGroupEntry },
  title: 'Components/Document/DocumentActionsGroup/Entry',
  component: DocumentActionsGroupEntry,
  tags: ['autodocs']
}

export const Default = {
  args: {
    iconName: 'star',
    label: 'Star',
    tooltipPlacement: 'right',
    tooltipLabel: 'Test',
    filledBtnClass: 'starred',
    isFilled: false
  }
}
export const Filled = {
  args: {
    iconName: 'star',
    label: 'Star',
    tooltipLabel: 'Test',
    tooltipPlacement: 'right',
    isFilled: true
  }
}

