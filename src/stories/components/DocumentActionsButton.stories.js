import DocumentActionsButton from '@/components/DocumentActionButton'

export default {
  components: { DocumentActionsButton },
  title: 'Components/DocumentActions/Button',
  component: DocumentActionsButton,
  tags: ['autodocs']
}

export const Default = {
  args: {
    iconName: 'star',
    label: 'Star',
    tooltipPlacement: 'top',
    tooltipLabel: 'Test',
    btnClass: 'btn-link btn-sm',
    filledBtnClass: 'starred',
    isFilled: false
  }
}
export const Filled = {
  args: {
    iconName: 'star',
    label: 'Star',
    tooltipLabel: 'Test',
    tooltipPlacement: 'top',
    btnClass: 'btn-link btn-sm',
    filledBtnClass: 'starred',
    isFilled: true
  }
}

