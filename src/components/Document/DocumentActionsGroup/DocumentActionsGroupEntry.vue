<template>
  <button-row-action
    :class="classList"
    :disabled="disabled"
    :hide-tooltip="hideTooltip"
    :icon-left-hover-weight="iconHoverWeight"
    :icon-left-weight="iconWeight"
    :icon-left="icon"
    :label="label"
    :tooltip-placement="tooltipPlacement"
    class="document-actions-entry flex-shrink-0"
  />
</template>

<script setup>
import { computed } from 'vue'

import ButtonRowAction from '@/components/Button/ButtonRowAction/ButtonRowAction'
import { PLACEMENT, placementValidator } from '@/enums/placements'

defineOptions({ name: 'DocumentActionsEntry' })

const props = defineProps({
  /**
   * Icon name
   */
  icon: {
    type: [String, Object, Array],
    required: true
  },
  /**
   * Button label
   */
  label: {
    type: String,
    default: ''
  },
  /**
   * Button is fill
   */
  fill: {
    type: Boolean
  },
  /**
   * Hide the button tooltip
   */
  hideTooltip: {
    type: Boolean
  },
  /**
   * Tooltip's placement on each action using Floating UI: https://floating-ui.com/docs/tutorial#placements
   * @values 'auto', 'auto-start', 'auto-end', 'top', 'right', 'bottom', 'left', 'top-start', 'right-start', 'bottom-start', 'left-start', 'top-end', 'right-end', 'bottom-end', 'left-end'
   */
  tooltipPlacement: {
    type: String,
    default: PLACEMENT.TOP,
    validator: placementValidator
  },
  /**
   * Disable button
   */
  disabled: {
    type: Boolean
  }
})

const iconWeight = computed(() => (props.fill ? 'fill' : 'regular'))
const iconHoverWeight = computed(() => (props.fill ? 'fill' : 'bold'))
const classList = computed(() => ({ 'document-actions-entry--fill': props.fill }))
</script>

<style lang="scss" scoped>
.document-actions-entry {
  &--fill {
    --bs-btn-color: var(--bs-action-text-emphasis);
  }
}
</style>
