import DocumentActionsEntry from '@/components/DocumentActionsEntry'

export default {
  components: { DocumentActionsEntry },
  title: 'Components/DocumentActionsGroup/Entry',
  component: DocumentActionsEntry,
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

