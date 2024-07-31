<script setup>
import FormControlRangeSliderBullet from './FormControlRangeSliderBullet'

defineProps({
  modelValue: {
    type: Number
  },
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
  <div class="form-control-range-slider" aria-hidden>
    <form-control-range-slider-bullet
      :model-value="modelValue"
      :min="min"
      :max="max"
      :step="step"
      @update:modelValue="$emit('update:modelValue', $event)"
    />
  </div>
</template>

<style lang="scss" scoped>
.form-control-range-slider {
  position: relative;
  height: 1px;
  background-color: var(--bs-action);
}
</style>
