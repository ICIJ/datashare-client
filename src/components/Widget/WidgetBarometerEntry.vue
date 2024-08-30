<template>
  <b-card
    tag="a"
    :href="to"
    class="widget-entity"
    body-class="d-flex flex-column align-items-center gap-1"
    :border-variant="variant"
  >
    <phosphor-icon :variant="variant" :name="icon" :weight="ICON_WEIGHT.BOLD" />
    <span class="widget-entity__value fw-bold"
      ><slot>{{ humanValue }}</slot></span
    >
    <span class="widget-entity__label text-secondary-emphasis">{{ label }}</span>
  </b-card>
</template>

<script setup>
import { PhosphorIcon } from '@icij/murmur-next'

import humanNumber from '@/utils/humanNumber'
import { ICON_WEIGHT } from '@/enums/iconWeights'
import { variantValidator } from '@/enums/variants'
const props = defineProps({
  icon: { type: String },
  value: { type: [Number, String] },
  label: { type: String },
  to: { type: String, default: '#' },
  variant: { type: String, validator: variantValidator }
})
const humanValue = typeof props.value === 'number' ? humanNumber(props.value) : props.value
</script>
