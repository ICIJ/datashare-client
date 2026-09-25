<script setup>
import { ButtonIcon } from '@icij/murmur'

defineProps({
  hideLabel: {
    type: Boolean,
    default: true
  },
  hideTooltip: {
    type: Boolean,
    default: false
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})
</script>

<template>
  <button-icon
    variant="link"
    class="bg-action-subtle text-action-emphasis-subtle p-1"
    :hide-label="hideLabel"
    :hide-tooltip="hideTooltip"
    :tooltip-delay="tooltipDelay"
  />
</template>
