<script setup>
import { range } from 'd3'
import { computed } from 'vue'

import FormControlRangeTicksEntry from './FormControlRangeTicksEntry'

const props = defineProps({
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

const steps = computed(() => {
  return range(props.min, props.max + props.step, props.step)
})

const style = computed(() => {
  const minWidth = String(props.max).length
  return { minWidth: `${minWidth}em` }
})
</script>

<template>
  <div class="form-control-range-ticks d-flex flex-row gap-1 gap-sm-3 mx-3">
    <form-control-range-ticks-entry
      v-for="s in steps"
      :key="s"
      :value="s"
      :active="modelValue === s"
      :style="style"
      @click="$emit('update:modelValue', s)"
    />
  </div>
</template>
