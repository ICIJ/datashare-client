<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

defineOptions({ name: 'DocumentUserActionsEntry' })

const props = defineProps({
  /**
   * Label of the button
   */
  label: {
    type: String,
    required: true
  },
  /**
   * Number value as label
   */
  value: {
    type: String,
    required: true
  },
  /**
   * Entry icon
   */
  icon: {
    type: [Array, Object, String],
    required: true
  },
  /**
   * Show shorter label (only value as label)
   */
  shorterLabel: {
    type: Boolean,
    default: false
  },
  /**
   * Force hide tooltip
   */
  hideTooltip: {
    type: Boolean,
    default: false
  }
})

const actionLabel = computed(() => (props.shorterLabel ? props.value : props.label))
</script>

<template>
  <button-icon
    class="document-user-actions-entry border-0"
    variant="outline-action"
    :icon-left="icon"
    :label="actionLabel"
    :tooltip-label="label"
    :aria-describedby="label"
    :hide-label="false"
    :hide-tooltip="hideTooltip"
    :show-tooltip-force="!hideTooltip"
  />
</template>

<style lang="scss" scoped>
.document-user-actions-entry {
  --bs-btn-color: var(--bs-action-text-emphasis);
  --bs-btn-bg: transparent;
  --bs-btn-hover-bg: #{$action};
  --bs-btn-hover-color: #{text-contrast($action)};
}
</style>
