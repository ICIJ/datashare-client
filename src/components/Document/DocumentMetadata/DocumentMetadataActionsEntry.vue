<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import { ICON_WEIGHT, iconWeightValidator } from '@/enums/iconWeights'

defineProps({
  icon: {
    type: [String, Object, Array],
    required: true
  },
  iconWeight: {
    type: String,
    default: ICON_WEIGHT.REGULAR,
    validator: iconWeightValidator
  },
  iconHoverWeight: {
    type: String,
    default: ICON_WEIGHT.BOLD,
    validator: iconWeightValidator
  },
  label: {
    type: String,
    required: true
  }
})
</script>

<template>
  <button-icon
    class="border-0"
    hide-label
    variant="outline-secondary"
    :label="label"
    :icon-left="icon"
    :icon-left-weight="iconWeight"
    :icon-left-hover-weight="iconHoverWeight"
  />
</template>
