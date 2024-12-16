<script setup>
import FormControlRangeSliderBullet from './FormControlRangeSliderBullet'

const modelValue = defineModel({
  type: Number
})

defineProps({
  step: {
    type: Number
  },
  min: {
    type: Number
  },
  max: {
    type: Number
  }
})
</script>

<template>
  <div class="form-control-range-slider" aria-hidden="true">
    <form-control-range-slider-bullet v-model="modelValue" :min="min" :max="max" :step="step" />
  </div>
</template>

<style lang="scss" scoped>
.form-control-range-slider {
  position: relative;
  height: 1px;
  background-color: var(--bs-action);
}
</style>
