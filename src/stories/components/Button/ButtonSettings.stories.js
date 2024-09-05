import ButtonSettings from '@/components/Button/ButtonSettings'
import { PLACEMENT } from '@/enums/placements'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonSettings',
  component: ButtonSettings,
  args: {
    loading: false,
    disabled: false,
    tooltipPlacement: PLACEMENT.LEFT
  }
}

export const Default = {}
