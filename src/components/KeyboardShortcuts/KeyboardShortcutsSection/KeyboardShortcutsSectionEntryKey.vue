<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import IPhCommand from '~icons/ph/command'
import IPhWindowsLogoFill from '~icons/ph/windows-logo-fill'
import IPhOption from '~icons/ph/option'
import IPhArrowRight from '~icons/ph/arrow-right'
import IPhArrowLeft from '~icons/ph/arrow-left'
import IPhArrowUp from '~icons/ph/arrow-up'
import IPhArrowDown from '~icons/ph/arrow-down'
import IPhArrowFatUp from '~icons/ph/arrow-fat-up'
import IPhControl from '~icons/ph/control'

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
      return getShortkeyOS() === 'mac' ? IPhCommand : IPhWindowsLogoFill
    case '⌘':
      return IPhCommand
    case 'meta':
      return IPhCommand
    case 'option':
      return IPhOption
    case '→':
      return IPhArrowRight
    case 'arrowright':
      return IPhArrowRight
    case '←':
      return IPhArrowLeft
    case 'arrowleft':
      return IPhArrowLeft
    case '↑':
      return IPhArrowUp
    case 'arrowup':
      return IPhArrowUp
    case '↓':
      return IPhArrowDown
    case 'arrowdown':
      return IPhArrowDown
    case 'shift':
      return IPhArrowFatUp
    case '⌃':
      return IPhControl
    default:
      return null
  }
})
</script>

<template>
  <kbd class="keyboard-shortcuts-section-entry-key flex-shrink-0">
    <app-icon
      v-if="icon"
      :name="icon"
      size="1em"
    />
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
