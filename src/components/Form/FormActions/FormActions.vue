<script setup>
import { watch, provide } from 'vue'

import FormActionsCompact from './FormActionsCompact'

const props = defineProps({
  compact: {
    type: Boolean
  },
  size: {
    type: String,
    default: 'md'
  },
  variant: {
    type: String,
    default: 'outline-secondary'
  },
  compactVariant: {
    type: String,
    default: 'action'
  },
  tag: {
    type: String,
    default: 'div'
  },
  ariaLabel: {
    type: String
  }
})

watch(
  () => props.size,
  () => provide('size', props.size),
  { immediate: true }
)

watch(
  () => props.variant,
  () => provide('variant', props.variant),
  { immediate: true }
)
</script>

<template>
  <component :is="tag" class="form-actions" :aria-label="ariaLabel">
    <template v-if="compact">
      <slot name="start" />
      <form-actions-compact :variant="compactVariant" :size="size">
        <slot name="compact" />
        <template #dropdown>
          <slot />
        </template>
      </form-actions-compact>
      <slot name="end" />
    </template>
    <template v-else>
      <slot name="start" />
      <slot name="compact" />
      <slot />
      <slot name="end" />
    </template>
  </component>
</template>

<style lang="scss">
.form-actions {
  display: flex;
  justify-content: flex-end;
  flex-wrap: wrap;
  column-gap: $spacer-lg;
  row-gap: $spacer-sm;

  @include media-breakpoint-down(md) {
    justify-content: flex-start;
  }

  &__dropdown > li .btn {
    display: flex;
    min-width: 100%;
    --bs-btn-border-width: 0;
  }
}
</style>
