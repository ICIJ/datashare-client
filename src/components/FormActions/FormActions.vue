<script setup>
import { provide } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'outline-lighter'
  },
  tag: {
    type: String,
    default: 'div'
  },
  ariaLabel: {
    type: String
  }
})

provide('size', props.size)
provide('variant', props.variant)
</script>

<template>
  <component :is="tag" class="form-actions" :aria-label="ariaLabel">
    <slot />
  </component>
</template>

<style lang="scss" scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  column-gap: $spacer-lg;
  row-gap: $spacer-sm;

  @include media-breakpoint-down(md) {
    justify-content: flex-start;
  }
}
</style>
