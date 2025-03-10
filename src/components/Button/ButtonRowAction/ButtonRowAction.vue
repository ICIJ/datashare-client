<script setup>
import ButtonIcon from '@/components/Button/ButtonIcon'
import { SIZE, buttonSizeValidator } from '@/enums/sizes'

defineProps({
  icon: { 
    type: [String, Object], 
    required: true 
  },
  size: { 
    type: String, 
    validator: buttonSizeValidator, 
    default: SIZE.SM 
  },
  label: { 
    type: String 
  },
  disabled: { 
    type: Boolean, 
    default: false 
  },
  to: { 
    type: Object 
  }
})
</script>

<template>
  <button-icon
    :disabled="disabled"
    :icon-left="icon"
    :label="label"
    :size="size"
    :to="to"
    hide-label
    icon-left-hover-weight="bold"
    square
    variant="outline-secondary"
    class="border-0"
  />
</template>
