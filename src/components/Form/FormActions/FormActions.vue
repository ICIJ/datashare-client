<script setup>
import { computed, watch, provide } from 'vue'

import FormActionsCompact from './FormActionsCompact'

import { useBreakpoints } from '@/utils/breakpoints'

const props = defineProps({
  compact: {
    type: Boolean
  },
  compactAuto: {
    type: Boolean
  },
  compactAutoBreakpoint: {
    type: String,
    default: 'md'
  },
  compactVariant: {
    type: String,
    default: 'action'
  },
  variant: {
    type: String,
    default: 'outline-secondary'
  },
  size: {
    type: String,
    default: 'md'
  },
  tag: {
    type: String,
    default: 'div'
  },
  ariaLabel: {
    type: String
  }
})

const { breakpointDown } = useBreakpoints()

const isCompact = computed(() => {
  // If compactAuto is true, use the compactAutoBreakpoint value to determine if the
  // form actions should be compact. This is done through the reactive breakpointDown value.
  // Alternativly, if compactAuto is false, use the compact prop value.
  return (props.compactAuto && breakpointDown.value[props.compactAutoBreakpoint]) || props.compact
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
    <template v-if="isCompact">
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
