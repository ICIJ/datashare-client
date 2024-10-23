import ButtonToggleSettings from '@/components/Button/ButtonToggleSettings'
import { PLACEMENT } from '@/enums/placements'

export default {
  tags: ['autodocs'],
  title: 'Components/Button/ButtonToggleSettings',
  component: ButtonToggleSettings,
  args: {
    loading: false,
    disabled: false,
    active: false,
    tooltipPlacement: PLACEMENT.LEFT
  }
}

export const Default = {}
