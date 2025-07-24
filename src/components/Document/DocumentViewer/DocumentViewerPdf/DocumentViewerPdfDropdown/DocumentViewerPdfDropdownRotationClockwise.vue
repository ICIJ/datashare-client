<script setup>
import { ROTATIONS } from '@/enums/documentViewerPdf'

const modelValue = defineModel({ type: Number, default: 0 })

function rotate() {
  const currentIndex = ROTATIONS.indexOf(modelValue.value)
  const nextIndex = (currentIndex + 1) % ROTATIONS.length
  modelValue.value = ROTATIONS[nextIndex]
}
</script>

<template>
  <b-dropdown-item-button @click="rotate">
    <span class="d-flex align-items-center gap-2">
      <phosphor-icon :name="PhArrowClockwise" />
      Rotate clockwise
    </span>
  </b-dropdown-item-button>
</template>
