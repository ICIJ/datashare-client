import DocumentActionsGroupEntry from '@/components/Document/DocumentActionsGroup/DocumentActionsGroupEntry'
import { PLACEMENT } from '@/enums/placements'

export default {
  components: { DocumentActionsGroupEntry },
  title: 'Components/Document/DocumentActionsGroup/DocumentActionsGroupEntry',
  component: DocumentActionsGroupEntry,
  tags: ['autodocs']
}

export const Default = {
  args: {
    icon: 'star',
    label: 'Star',
    tooltipPlacement: PLACEMENT.RIGHT,
    tooltipLabel: 'Test',
    filledBtnClass: 'starred',
    fill: false
  }
}

export const Filled = {
  args: {
    icon: 'star',
    label: 'Star',
    tooltipLabel: 'Test',
    tooltipPlacement: PLACEMENT.RIGHT,
    fill: true
  }
}
