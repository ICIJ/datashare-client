<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
defineOptions({ name: 'DocumentUserActionsEntry' })
const props = defineProps({
  /**
   * Label of the button
   */
  label: { type: String, required: true },
  /**
   * Number value as label
   */
  value: { type: String, required: true },
  /**
   * Entry icon
   */
  icon: { type: String, required: true },
  /**
   * Show compact label (only value as label)
   */
  compact: { type: Boolean, default: false },
  /**
   * Hide label
   */
  hideLabel: { type: Boolean, default: false },
  /**
   * Force hide tooltip
   */
  hideTooltip: { type: Boolean, default: false },
  /**
   * Display as a dropdown item
   */
  dropdownItem: { type: Boolean, default: false }
})
const actionLabel = computed(() => {
  return props.compact ? props.value : props.label
})
</script>

<template>
  <button-icon
    class="document-user-actions-entry text-action-emphasis border-0 rounded text-nowrap"
    :class="{ 'w-100': dropdownItem, 'd-flex justify-content-center flex-grow-0': !dropdownItem }"
    variant="outline-action"
    :icon-left="icon"
    :label="actionLabel"
    :tooltip-label="label"
    :aria-describedby="label"
    :hide-label="hideLabel"
    :hide-tooltip="hideTooltip"
    :show-tooltip-force="!hideTooltip"
  />
</template>
<style lang="scss" scoped>
.document-user-actions-entry {
  background: var(--bs-btn-action-bg);
  &:hover {
    background: var(--bs-btn-hover-bg);
    color: var(--bs-btn-hover-color) !important;
  }
}
</style>
