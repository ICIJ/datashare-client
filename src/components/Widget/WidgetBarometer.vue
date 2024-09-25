<template>
  <b-card
    :tag="tag"
    :href="to"
    :border-variant="borderVariant"
    :class="classList"
    class="widget-barometer"
    body-class="d-flex flex-column align-items-center gap-1 "
  >
    <span style="height: 20px">
      <phosphor-icon :variant="variant" :name="icon" :weight="ICON_WEIGHT.BOLD" />
    </span>
    <span class="widget-barometer__value fw-bold">
      <slot>{{ humanValue }}</slot>
    </span>
    <span class="widget-barometer__label">
      <slot name="label">{{ label }}</slot>
    </span>
  </b-card>
</template>

<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import humanNumber from '@/utils/humanNumber'
import { ICON_WEIGHT } from '@/enums/iconWeights'
import { variantValidator } from '@/enums/variants'

const props = defineProps({
  icon: { type: String },
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
    --bs-card-border-width: 0;
  }
}
</style>
