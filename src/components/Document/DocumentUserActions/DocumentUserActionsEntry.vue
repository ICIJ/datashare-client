<template>
  <button-icon
    class="document-user-actions-entry text-action-emphasis border-0 d-flex flex-grow-0 justify-content-center rounded"
    variant="outline-action"
    :icon-left="icon"
    :label="actionLabel"
    :tooltip-label="label"
    :aria-describedby="label"
    :hide-label="hideLabel"
    :hide-tooltip="hideTooltip"
  />
</template>
<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'
defineOptions({ name: 'DocumentUserActionsEntry' })
const props = defineProps({
  label: { type: String, required: true },
  value: { type: String, required: true },
  icon: { type: String, required: true },
  first: { type: Boolean },
  compact: { type: Boolean, default: false },
  hideLabel: { type: Boolean, default: false },
  hideTooltip: { type: Boolean, default: false }
})
const actionLabel = computed(() => {
  return props.compact ? props.value : props.label
})
</script>

<style lang="scss" scoped>
.document-user-actions-entry {
  background: var(--bs-btn-action-bg);
  &:hover {
    background: var(--bs-btn-hover-bg);
    color: var(--bs-btn-hover-color) !important;
  }
}
</style>
