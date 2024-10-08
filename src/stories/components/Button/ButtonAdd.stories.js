import ButtonAdd from '@/components/Button/ButtonAdd'
import { PLACEMENT } from '@/enums/placements'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonAdd',
  component: ButtonAdd,
  args: {
    loading: false,
    disabled: false,
    tooltipPlacement: PLACEMENT.LEFT
  }
}

export const Default = {}
