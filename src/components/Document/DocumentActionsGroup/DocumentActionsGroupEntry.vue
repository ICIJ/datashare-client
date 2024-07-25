<template>
  <icon-button
    :id="btnId"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
    :label="label"
    hide-label
    :hide-tooltip="hideTooltip"
    :tooltip-placement="tooltipPlacement"
    square
    variant="outline-tertiary"
    class="document-actions-entry border-0"
    :class="{ 'document-actions-entry--fill': fill }"
    :disabled="disabled"
  />
</template>

<script setup>
import { computed } from 'vue'
import uniqueId from 'lodash/uniqueId'

import IconButton from '@/components/IconButton'

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
  }
})

const btnId = uniqueId('action-btn-')
const iconWeight = computed(() => (props.fill ? 'fill' : 'regular'))
const iconHoverWeight = computed(() => (props.fill ? 'fill' : 'bold'))
</script>

<style lang="scss" scoped>
.document-actions-entry {
  --bs-btn-hover-color: var(--bs-primary-text-emphasis);

  &--fill {
    --bs-btn-color: var(--bs-primary-text-emphasis);
  }
}
</style>
