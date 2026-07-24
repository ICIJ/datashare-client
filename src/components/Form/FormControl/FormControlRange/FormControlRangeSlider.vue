<script setup>
import { computed } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'
import FormControlRangeSliderBullet from './FormControlRangeSliderBullet'

const modelValue = defineModel({
  type: Number
})

const props = defineProps({
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

const { steps, hasOverflow } = useRangeSteps(
  () => props.min,
  () => props.max,
  () => props.step,
  modelValue
)

// Dot centres sit at (i + 0.5) / N of the track. The solid line runs to the
// centre of the normal-max tick; the dashed tail bridges from there to the
// centre of the appended custom tick.
const stepCount = computed(() => steps.value.length)
const maxIndex = computed(() => (hasOverflow.value ? stepCount.value - 2 : stepCount.value - 1))
const solidEnd = computed(() => ((maxIndex.value + 0.5) / stepCount.value) * 100)
const dashEnd = computed(() => ((stepCount.value - 0.5) / stepCount.value) * 100)

const solidWidth = computed(() => (hasOverflow.value ? `${solidEnd.value}%` : '100%'))
const dashStyle = computed(() => {
  return {
    left: `${solidEnd.value}%`,
    width: `${dashEnd.value - solidEnd.value}%`
  }
})
</script>

<template>
  <div
    class="form-control-range-slider"
    aria-hidden="true"
  >
    <span
      class="form-control-range-slider__track"
      :style="{ width: solidWidth }"
    />
    <span
      v-if="hasOverflow"
      class="form-control-range-slider__track form-control-range-slider__track--dashed"
      :style="dashStyle"
    />
    <form-control-range-slider-bullet
      v-model="modelValue"
      :min="min"
      :max="max"
      :step="step"
    />
  </div>
</template>

<style lang="scss" scoped>
.form-control-range-slider {
  position: relative;
  height: 1px;

  // The track is drawn as absolutely-positioned child segments rather than a
  // background on the container, so the out-of-range tail can render dashed
  // without changing the container width the bullet positions against.
  &__track {
    position: absolute;
    left: 0;
    top: 0;
    height: 1px;
    background-color: var(--bs-action);

    &--dashed {
      height: 0;
      background-color: transparent;
      border-top: 1px dashed var(--bs-action);
    }
  }
}
</style>
