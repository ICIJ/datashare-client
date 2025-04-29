<template>
  <button-icon
    :class="classList"
    :disabled="disabled"
    :hide-tooltip="hideTooltip"
    :icon-left-hover-weight="iconHoverWeight"
    :icon-left-size="iconSize"
    :icon-left-weight="iconWeight"
    :icon-left="icon"
    :label="label"
    :size="size"
    :tooltip-placement="tooltipPlacement"
    class="document-actions-entry border-0 flex-shrink-0"
    hide-label
    square
    variant="outline-secondary"
  />
</template>

<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
import { SIZE } from '@/enums/sizes'
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
  },
  /**
   * Use vertical layout for the button
   */
  vertical: {
    type: Boolean
  }
})

const size = computed(() => (props.vertical ? SIZE.SM : SIZE.MD))
const iconSize = computed(() => (props.vertical ? SIZE.LG : SIZE.MD))
const iconWeight = computed(() => (props.fill ? 'fill' : 'regular'))
const iconHoverWeight = computed(() => (props.fill ? 'fill' : 'bold'))
const classList = computed(() => ({ 'document-actions-entry--fill': props.fill }))
</script>

<style lang="scss" scoped>
.document-actions-entry {
  --bs-btn-hover-color: var(--bs-action-text-emphasis);

  &--fill {
    --bs-btn-color: var(--bs-action-text-emphasis);
  }
}
</style>
