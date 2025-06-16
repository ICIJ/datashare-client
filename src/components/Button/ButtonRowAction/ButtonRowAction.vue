<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import { SIZE, buttonSizeValidator } from '@/enums/sizes'
import { ICON_WEIGHT, iconWeightValidator } from '@/enums/iconWeights'

defineProps({
  icon: {
    type: [String, Object, Array]
  },
  iconWeight: {
    type: String,
    default: ICON_WEIGHT.BOLD,
    validator: iconWeightValidator
  },
  size: {
    type: String,
    validator: buttonSizeValidator,
    default: SIZE.SM
  }
})
</script>

<template>
  <button-icon
    :icon-left="icon"
    :icon-left-hover-weight="iconWeight"
    :size="size"
    hide-label
    hide-tooltip
    square
    variant="outline-secondary"
    class="border-0"
  />
</template>
