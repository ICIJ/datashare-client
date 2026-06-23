<script setup>
import FormControlRangeSlider from './FormControlRangeSlider'
import FormControlRangeTicks from './FormControlRangeTicks'

const modelValue = defineModel({
  type: Number,
  default: 0
})

defineProps({
  name: {
    type: String
  },
  min: {
    type: Number,
    default: 0
  },
  max: {
    type: Number,
    default: 10
  },
  step: {
    type: Number,
    default: 1
  }
})
</script>

<template>
  <div class="form-control-range d-inline-block">
    <form-control-range-slider
      v-model="modelValue"
      class="mb-3"
      :min="min"
      :max="max"
      :step="step"
    />
    <form-control-range-ticks
      v-model="modelValue"
      :min="min"
      :max="max"
      :step="step"
    />
    <input
      v-if="name"
      type="hidden"
      :name="name"
      :value="modelValue"
    >
  </div>
</template>

<style lang="scss" scoped>
.form-control-range {
  padding-top: $spacer-xs;
  // The slider track and the ticks row share the same width, so the bullet
  // (centred at (i + 0.5)/N of the track) lines up with each tick centre.
}
</style>
