<template>
  <button-icon
    :icon-left="icon"
    :icon-left-size="iconSize"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
    :label="label"
    :hide-tooltip="hideTooltip"
    :tooltip-placement="tooltipPlacement"
    :size="size"
    hide-label
    square
    variant="outline-secondary"
    class="document-actions-entry border-0"
    :class="{ 'document-actions-entry--fill': fill }"
    :disabled="disabled"
  />
</template>

<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentActionsEntry' })

const props = defineProps({
  /**
   * Icon name
   */
  icon: {
    type: String,
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
   * Class to apply to the action button
   */
  btnClass: {
    type: String,
    default: 'btn-sm'
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
   * Class to apply to the action button when document is fill
   */
  tooltipPlacement: {
    type: String,
    default: 'bottom'
  },
  /**
   * Disable button
   */
  disabled: {
    type: Boolean,
    default: false
  },
  /**
   * Button size
   */
  size: {
    type: String,
    default: 'md'
  },
  /**
   * Button's icon size
   */
  iconSize: {
    type: String,
    default: 'md'
  }
})

const iconWeight = computed(() => (props.fill ? 'fill' : 'regular'))
const iconHoverWeight = computed(() => (props.fill ? 'fill' : 'bold'))
</script>

<style lang="scss" scoped>
.document-actions-entry {
  --bs-btn-hover-color: var(--bs-action-text-emphasis);

  &--fill {
    --bs-btn-color: var(--bs-action-text-emphasis);
  }
}
</style>
