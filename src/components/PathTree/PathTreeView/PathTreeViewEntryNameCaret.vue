<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'
import { PhCaretDown, PhCircleNotch } from '@phosphor-icons/vue'

const props = defineProps({
  collapse: {
    type: Boolean
  },
  loading: {
    type: Boolean
  }
})

const classList = computed(() => ({
  'path-tree-view-entry-name-caret--collapse': props.collapse,
  'path-tree-view-entry-name-caret--loading': props.loading
}))

const icon = computed(() => {
  return props.loading ? PhCircleNotch : PhCaretDown
})
</script>

<template>
  <div
    class="path-tree-view-entry-name-caret d-flex"
    :class="classList"
  >
    <phosphor-icon
      :name="icon"
      :spin="loading"
      :fill="!loading"
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
