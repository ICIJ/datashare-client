<template>
  <b-card
    :tag="tag"
    :href="to"
    :border-variant="borderVariant"
    :class="classList"
    class="widget-barometer"
    body-class="d-flex flex-column flex-truncate text-center gap-1 "
  >
    <phosphor-icon :variant="variant" size="2rem" :name="icon" />
    <div class="widget-barometer__value fw-bold text-truncate w-100">
      <slot>{{ humanValue }}</slot>
    </div>
    <div class="widget-barometer__label text-truncate w-100">
      <slot name="label">{{ label }}</slot>
    </div>
  </b-card>
</template>

<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import humanNumber from '@/utils/humanNumber'
import { variantValidator } from '@/enums/variants'

const props = defineProps({
  icon: { type: [String, Object, Array] },
  value: { type: [Number, String] },
  label: { type: String },
  to: { type: String, default: null },
  variant: { type: String, validator: variantValidator, default: null },
  borderVariant: { type: String, validator: variantValidator, default: null }
})

const humanValue = computed(() => {
  if (typeof props.value === 'number') {
    return humanNumber(props.value)
  }
  return props.value
})

const tag = computed(() => {
  return props.to ? 'a' : 'div'
})

const classList = computed(() => {
  return {
    'widget-barometer--no-border': !props.borderVariant,
    'widget-barometer--clickable': props.to
  }
})
</script>

<style lang="scss" scoped>
.widget-barometer {
  height: 100%;

  &[href]:hover {
    border-color: $input-hover-border-color !important;
  }

  &[href]:hover &__label {
    color: var(--bs-body-color);
  }

  &__label {
    color: var(--bs-secondary-text-emphasis);
  }

  &--no-border {
    --bs-card-border-color: var(--bs-card-bg);
  }
}
</style>
