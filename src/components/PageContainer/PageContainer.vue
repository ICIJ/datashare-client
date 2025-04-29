<script setup>
import { computed } from 'vue'

import { useBreakpoints } from '@/composables/useBreakpoints'
import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  fluid: {
    type: Boolean
  },
  compactBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  },
  deck: {
    type: Boolean,
    default: false
  },
  sticky: {
    type: Boolean,
    default: false
  }
})

const { breakpointDown } = useBreakpoints()

const compact = computed(() => {
  return breakpointDown.value[props.compactBreakpoint]
})

const classList = computed(() => {
  return {
    'page-container--fluid': props.fluid,
    'page-container--compact': compact.value,
    'page-container--sticky': props.sticky,
    'page-container--deck': props.deck
  }
})
</script>

<template>
  <div class="page-container" :class="classList">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  @include make-container($spacer * 2);

  &--deck {
    display: flex;
    flex-direction: column;
    gap: $spacer-lg;
  }

  &--sticky {
    position: sticky;
    top: 0;
    left: 0;
    background: var(--bs-body-bg);
    z-index: $zindex-sticky;
  }

  &--fluid {
    max-width: calc(100vw - var(--app-sidebar-width));
  }

  &--compact {
    --bs-gutter-x: #{$spacer * 2};
  }

  &:not(&--fluid) {
    @each $breakpoint, $container-max-width in $container-max-widths {
      @include media-breakpoint-up($breakpoint, $grid-breakpoints) {
        max-width: $container-max-width;
      }
    }
  }
}
</style>
