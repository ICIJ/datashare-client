<script setup>
import { computed } from 'vue'

import { useContrastVariant } from '@/composables/useContrastVariant'
import AppSpinner from '@/components/AppSpinner/AppSpinner'

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
    <template #overlay="bindings">
      <slot name="overlay" v-bind="bindings">
        <app-spinner :size="size" :variant="spinnerVariant ?? contrastOverlayVariant" />
      </slot>
    </template>
    <slot />
  </b-overlay>
</template>
