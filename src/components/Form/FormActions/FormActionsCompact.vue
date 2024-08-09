<script setup>
import { computed, watch, provide } from 'vue'

import FormActionsCompactDropdown from './FormActionsCompactDropdown'

const props = defineProps({
  variant: {
    type: String,
    default: 'action'
  },
  size: {
    type: String,
    default: 'md'
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

const classList = computed(() => {
  return [`form-actions-compact--${props.variant}`]
})
</script>

<template>
  <div class="form-actions-compact" :class="classList">
    <b-button-group class="form-actions-compact__group" :size="size">
      <slot />
    </b-button-group>
    <form-actions-compact-dropdown :variant="variant" :size="size">
      <slot name="dropdown" />
    </form-actions-compact-dropdown>
  </div>
</template>

<style lang="scss" scoped>
.form-actions-compact {
  --form-actions-compact-bg: transparent;
  --form-actions-compact-color: var(--bs-body-color);

  display: flex;
  align-items: center;
  gap: $spacer-xxs;
  border-radius: var(--bs-border-radius);
  background: var(--form-actions-compact-bg);
  color: var(--form-actions-compact-color);

  &__group {
    position: relative;

    &:has(*) {
      margin-right: $spacer-xxs;

      &:after {
        content: '';
        width: 1px;
        position: absolute;
        left: calc(100% + #{$spacer-xxs});
        top: 50%;
        height: 65%;
        transform: translateY(-50%);
        display: flex;
        background: var(--form-actions-compact-color);
      }
    }
  }

  @each $variant, $value in $theme-colors {
    &--#{$variant} {
      --form-actions-compact-bg: var(--bs-#{$variant});
      --form-actions-compact-color: #{text-contrast($value)};
    }
  }
}
</style>
