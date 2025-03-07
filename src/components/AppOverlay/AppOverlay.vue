<script setup>
import { computed } from 'vue'
import { PhosphorIcon } from '@icij/murmur-next'

import { useContrastVariant } from '@/composables/contrast-variant'

const { contrastVariant: contrastOverlayVariant, variant: overlayVariant } = useContrastVariant()

const { spinnerSmall } = defineProps({
  spinnerSmall: {
    type: Boolean,
    default: false
  },
  spinnerVariant: {
    type: String
  },
  variant: {
    type: String,
    default: 'primary'
  }
})

const size = computed(() => (spinnerSmall ? 'md' : 'xl'))
</script>

<template>
  <b-overlay :opacity="0.7" :variant="overlayVariant ?? variant">
    <template #overlay>
      <phosphor-icon spin :size="size" :name="PhCircleNotch" :variant="spinnerVariant ?? contrastOverlayVariant" />
    </template>
    <slot />
  </b-overlay>
</template>
