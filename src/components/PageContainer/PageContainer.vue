<script setup>
import { computed } from 'vue'

import { breakpointSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  fluid: {
    type: Boolean
  },
  compactBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  }
})

const classList = computed(() => {
  return {
    'page-container--fluid': props.fluid,
    [`page-container--compact-${props.compactBreakpoint}`]: true
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
  @include make-container($spacer * 4);

  @each $breakpoint, $container-max-width in $container-max-widths {
    &--compact-#{$breakpoint} {
      @include media-breakpoint-down($breakpoint) {
        --bs-gutter-x: #{$spacer * 2};
      }
    }
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
