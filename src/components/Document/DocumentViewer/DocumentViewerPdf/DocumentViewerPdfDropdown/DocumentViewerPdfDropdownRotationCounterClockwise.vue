<script setup>
import { AppIcon } from '@icij/murmur-next'

import { ROTATIONS_COUNTERWISE } from '@/enums/documentViewerPdf'

const modelValue = defineModel({ type: Number, default: 0 })

function rotate() {
  const currentIndex = ROTATIONS_COUNTERWISE.indexOf(modelValue.value)
  const nextIndex = (currentIndex + 1) % ROTATIONS_COUNTERWISE.length
  modelValue.value = ROTATIONS_COUNTERWISE[nextIndex]
}
</script>

<template>
  <b-dropdown-item-button @click="rotate">
    <span class="d-flex align-items-center gap-2">
      <app-icon><i-ph-arrow-counter-clockwise /></app-icon>
      Rotate counterclockwise
    </span>
  </b-dropdown-item-button>
</template>
