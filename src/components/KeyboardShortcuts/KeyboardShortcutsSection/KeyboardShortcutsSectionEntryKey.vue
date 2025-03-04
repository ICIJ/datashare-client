<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { getShortkeyOS } from '@/utils/utils'

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const icon = computed(() => {
  switch (props.value) {
    case 'super':
      return getShortkeyOS() === 'mac' ? 'command' : ['windows-logo', 'fill']
    case '⌘':
      return 'command'
    case 'meta':
      return 'command'
    case 'option':
      return 'option'
    case '→':
      return 'arrow-right'
    case 'arrowright':
      return 'arrow-right'
    case '←':
      return 'arrow-left'
    case 'arrowleft':
      return 'arrow-left'
    case '↑':
      return 'arrow-up'
    case 'arrowup':
      return 'arrow-up'
    case '↓':
      return 'arrow-down'
    case 'arrowdown':
      return 'arrow-down'
    case 'shift':
      return 'arrow-fat-up'
    case '⌃':
      return 'control'
    default:
      return null
  }
})
</script>

<template>
  <kbd class="keyboard-shortcuts-section-entry-key flex-shrink-0">
    <phosphor-icon v-if="icon" :name="icon" size="1em" />
    <template v-else>{{ value }}</template>
  </kbd>
</template>

<style lang="scss" scoped>
.keyboard-shortcuts-section-entry-key {
  border-radius: $border-radius;
  line-height: 20px;
  min-height: calc(20px + 2 * #{$spacer-xxs});
  font-size: $font-size-base;
  font-weight: 400;
  padding: $spacer-xxs $spacer-xs;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-transform: capitalize;
  font-variant-numeric: tabular-nums;
}
</style>
