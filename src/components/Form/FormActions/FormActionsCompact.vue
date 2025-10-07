<script setup>
import { computed, watch, provide } from 'vue'

import FormActionsCompactDropdown from './FormActionsCompactDropdown'

import { VARIANT, variantValidator } from '@/enums/variants'
import { buttonSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  variant: {
    type: String,
    default: VARIANT.ACTION,
    validator: variantValidator
  },
  size: {
    type: String,
    default: SIZE.MD,
    validator: buttonSizeValidator
  },
  dropdownIcon: {
    type: [String, Object, Array],
    default: () => [PhDotsThreeOutlineVertical, 'fill']
  },
  teleportTo: {
    type: [String, Object],
    default: null
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
  <div
    class="form-actions-compact"
    :class="classList"
  >
    <b-button-group
      class="form-actions-compact__group"
      :size="size"
    >
      <slot />
      <form-actions-compact-dropdown
        :variant="variant"
        :size="size"
        :dropdown-icon="dropdownIcon"
        :teleport-to="teleportTo"
      >
        <slot name="dropdown" />
      </form-actions-compact-dropdown>
    </b-button-group>
  </div>
</template>

<style lang="scss" scoped>
@include color-mode(dark) {
  .form-actions-compact {
    --form-actions-compact-bg: transparent;
  }
}

.form-actions-compact {
  --form-actions-compact-bg: transparent;
  --form-actions-compact-color: var(--bs-body-color);

  display: flex;
  align-items: center;
  gap: $spacer-xxs;
  border-radius: var(--bs-border-radius);
  background: var(--form-actions-compact-bg);
  color: var(--form-actions-compact-color);
  margin-left: auto;

  @each $variant, $value in $theme-colors {
    &--#{$variant} {
      --form-actions-compact-bg: var(--bs-#{$variant});
      --form-actions-compact-color: #{color-contrast($value)};
    }
  }
}
</style>
