<script setup>
import { ButtonIcon } from '@icij/murmur-next'

defineProps({
  icon: {
    type: [String, Object, Array],
    required: true
  },
  iconWeight: {
    type: String,
    default: 'regular'
  },
  iconHoverWeight: {
    type: String,
    default: 'bold'
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button-icon
    class="entity-section-actions-entry"
    hide-label
    variant="light"
    square
    :label="label"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
  />
</template>

<style lang="scss" scoped>
.entity-section-actions-entry {
  --bs-btn-border-width: 0;
  --button-icon-square-size: #{math.div(44, 16) * 1rem};
}
</style>
