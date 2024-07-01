import { BTooltip } from 'bootstrap-vue-next'

import Icon from '@/components/Icon'

export default {
  title: 'Basics/Tooltip',
  component: BTooltip,
  render: (args) => ({
    components: {
      BTooltip,
      Icon
    },
    setup() {
      return {
        args
      }
    },
    template: `
      <span id="tooltip-target" class="p-5 mx-auto my-5 d-block bg-dark-subtle border border-dark text-center rounded" style="max-width: 300px">
        <Icon icon="crosshair" />
      </span>
      <BTooltip model-value manual target="#tooltip-target" placement="right">
        right
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="left">
        left
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="top">
        top
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="bottom">
        bottom
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="right-end">
        right-end
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="left-end">
        left-end
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="top-end">
        top-end
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="bottom-end">
        bottom-end
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="right-start">
        right-start
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="left-start">
        left-start
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="top-start">
        top-start
      </BTooltip>
      <BTooltip model-value manual target="#tooltip-target" placement="bottom-start">
        bottom-start
      </BTooltip>
    `
  })
}

export const Default = { }
