<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

const props = defineProps({
  collapse: {
    type: Boolean
  }
})
const classList = computed(() => ({
  'path-view-entry-name-caret--collapse': props.collapse
}))
</script>

<template>
  <div class="path-view-entry-name-caret d-flex" :class="classList">
    <phosphor-icon name="caret-down" fill class="path-view-entry-name-caret__icon" />
  </div>
</template>

<style lang="scss" scoped>
.path-view-entry-name-caret {
  &__icon {
    transition: $transition-base;
    color: var(--bs-primary);
  }

  &--collapse &__icon {
    color: var(--bs-tertiary);
    transform: rotate(-90deg);
  }
}
</style>
