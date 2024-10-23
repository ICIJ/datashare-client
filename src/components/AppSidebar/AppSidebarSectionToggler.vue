<script setup>
import { computed } from 'vue'

import ButtonIcon from '@/components/Button/ButtonIcon'

const props = defineProps({
  active: {
    type: Boolean
  },
  title: {
    type: String
  },
  icon: {
    type: String
  },
  to: {
    type: Object
  }
})

const classList = computed(() => {
  return {
    'app-sidebar-section-toggler--active': props.active
  }
})
</script>

<template>
  <button-icon
    :icon-left="icon"
    square
    hide-label
    variant="outline-primary"
    class="app-sidebar-section-toggler"
    tooltip-placement="right"
    :to="to"
    :label="title"
    :class="classList"
  >
    {{ title }}
  </button-icon>
</template>

<style lang="scss">
.app-sidebar-section-toggler {
  border-color: transparent;
  width: calc(#{$btn-line-height * $btn-font-size} + #{$spacer * 2} + #{$btn-border-width} * 2);
  height: calc(#{$btn-line-height * $btn-font-size} + #{$spacer * 2} + #{$btn-border-width} * 2);

  &:not(:hover) {
    color: var(--bs-body-color, inherit);
    background: var(--bs-body-bg);
  }

  &--active {
    border-color: var(--bs-primary);
  }
}
</style>
