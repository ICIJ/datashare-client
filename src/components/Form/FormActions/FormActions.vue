<script setup>
import { computed, watch, provide } from 'vue'

import FormActionsCompact from './FormActionsCompact'

import { useBreakpoints } from '@/composables/useBreakpoints'
import { VARIANT, variantValidator } from '@/enums/variants'
import { breakpointSizeValidator, buttonSizeValidator, SIZE } from '@/enums/sizes'

const props = defineProps({
  compact: {
    type: Boolean
  },
  compactAuto: {
    type: Boolean
  },
  compactAutoBreakpoint: {
    type: String,
    default: SIZE.MD,
    validator: breakpointSizeValidator
  },
  compactVariant: {
    type: String,
    default: VARIANT.ACTION,
    validator: variantValidator
  },
  variant: {
    type: String,
    default: VARIANT.OUTLINE_SECONDARY,
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
  tag: {
    type: String,
    default: 'div'
  },
  ariaLabel: {
    type: String
  },
  end: {
    type: Boolean
  }
})

const { breakpointDown } = useBreakpoints()

const isCompact = computed(() => {
  // If compactAuto is true, use the compactAutoBreakpoint value to determine if the
  // form actions should be compact. This is done through the reactive breakpointDown value.
  // Alternatively, if compactAuto is false, use the compact prop value.
  return (props.compactAuto && breakpointDown.value[props.compactAutoBreakpoint]) || props.compact
})

const classList = computed(() => {
  return {
    'form-actions--end': props.end,
    'form-actions--compact': isCompact.value
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
  <component :is="tag" class="form-actions" :aria-label="ariaLabel" :class="classList">
    <template v-if="isCompact">
      <slot name="start" v-bind="{ isCompact }" />
      <form-actions-compact :variant="compactVariant" :size="size" :dropdown-icon="dropdownIcon">
        <slot name="compact" v-bind="{ isCompact }" />
        <template #dropdown>
          <slot v-bind="{ isCompact }" />
        </template>
      </form-actions-compact>
      <slot name="end" v-bind="{ isCompact }" />
    </template>
    <template v-else>
      <slot name="start" v-bind="{ isCompact }" />
      <slot name="compact" v-bind="{ isCompact }" />
      <slot v-bind="{ isCompact }" />
      <slot name="end" v-bind="{ isCompact }" />
    </template>
  </component>
</template>

<style lang="scss">
.form-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  column-gap: $spacer;
  row-gap: $spacer-sm;

  &--end {
    justify-content: flex-end;
  }

  &--compact {
    flex-wrap: nowrap;
  }

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
