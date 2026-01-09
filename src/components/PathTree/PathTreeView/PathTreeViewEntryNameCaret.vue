<script setup>
import { computed } from 'vue'
import { AppIcon } from '@icij/murmur-next'

import IPhCaretDown from '~icons/ph/caret-down'
import IPhCircleNotch from '~icons/ph/circle-notch'

const props = defineProps({
  /**
   * Whether the caret is in the "collapsed" state (points to the right)
   */
  collapse: {
    type: Boolean
  },
  /**
   * Whether the entry is currently loading (replace the caret with a spinner)
   */
  loading: {
    type: Boolean
  }
})

const classList = computed(() => ({
  'path-tree-view-entry-name-caret--collapse': props.collapse,
  'path-tree-view-entry-name-caret--loading': props.loading
}))

const icon = computed(() => {
  return props.loading ? IPhCircleNotch : IPhCaretDown
})
</script>

<template>
  <div
    class="path-tree-view-entry-name-caret d-flex"
    :class="classList"
  >
    <app-icon
      :name="icon"
      :spin="loading"
      class="path-tree-view-entry-name-caret__icon"
    />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-entry-name-caret {
  &__icon {
    transition: $transition-base;
    color: var(--bs-primary);
  }

  &--collapse &__icon,
  &--loading &__icon {
    color: var(--bs-tertiary);
    transform: rotate(-90deg);
  }
}
</style>
