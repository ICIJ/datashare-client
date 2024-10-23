import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { PLACEMENT } from '@/enums/placements'

export default {
  title: 'Components/Document/DocumentSearchNav/DocumentSearchNav',
  component: DocumentSearchNav,
  tags: ['autodocs'],
  args: {
    disabledPrevious: false,
    disabledNext: false,
    tooltipPlacement: PLACEMENT.BOTTOM
  }
}

export const Default = {}
