import { BTooltip } from 'bootstrap-vue-next'
import { PhosphorIcon } from '@icij/murmur-next'

import { PLACEMENTS } from '@/enums/placements'

export default {
  title: 'Layout/Tooltip',
  component: BTooltip,
  render: args => ({
    components: {
      BTooltip,
      PhosphorIcon
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
        <PhosphorIcon name="crosshair" />
      </span>
      <BTooltip model-value manual target="#tooltip-target" :placement="placement" v-for="placement in placements">
        {{ placement }}
      </BTooltip>
    `
  })
}

export const Default = {}
