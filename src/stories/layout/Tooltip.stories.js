import { BTooltip } from 'bootstrap-vue-next'
import { AppIcon } from '@icij/murmur-next'

import IPhCrosshair from '~icons/ph/crosshair'
import { PLACEMENTS } from '@/enums/placements'

export default {
  title: 'Layout/Tooltip',
  component: BTooltip,
  render: args => ({
    components: {
      BTooltip,
      AppIcon,
      IPhCrosshair
    },
    setup() {
      const placements = PLACEMENTS
      return {
        args,
        placements
      }
    },
    template: `
      <span id="tooltip-target" class="p-5 mx-auto my-5 d-block bg-dark-subtle border border-dark text-center rounded" style="max-width: 300px">
        <AppIcon><IPhCrosshair /></AppIcon>
      </span>
      <BTooltip model-value manual target="#tooltip-target" :placement="placement" v-for="placement in placements">
        {{ placement }}
      </BTooltip>
    `
  })
}

export const Default = {}
