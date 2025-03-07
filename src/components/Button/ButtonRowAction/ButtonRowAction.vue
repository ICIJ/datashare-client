<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import { SIZE, buttonSizeValidator } from '@/enums/sizes'
defineProps({
  icon: { type: [String, Object], required: true },
  size: { type: String, validator: buttonSizeValidator, default: SIZE.SM },
  label: { type: String },
  disabled: { type: Boolean, default: false }
})
</script>

<template>
  <button-icon
    :icon-left="icon"
    icon-left-hover-weight="bold"
    hide-label
    :disabled="disabled"
    square
    :size="size"
    variant="outline-secondary"
    :label="label"
    class="border-0"
  />
</template>
