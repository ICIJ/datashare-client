<script setup>
import { computed } from 'vue'

import { useRangeSteps } from '@/composables/useRangeSteps'
import FormControlRangeTicksEntry from './FormControlRangeTicksEntry'

const modelValue = defineModel('modelValue', { type: Number })

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

const { steps } = useRangeSteps(
  () => props.min,
  () => props.max,
  () => props.step,
  modelValue
)

const style = computed(() => {
  const minWidth = String(props.max).length
  return { minWidth: `${minWidth}em` }
})
</script>

<template>
  <div class="form-control-range-ticks d-flex flex-row">
    <form-control-range-ticks-entry
      v-for="s in steps"
      :key="s"
      :value="s"
      :active="modelValue === s"
      :style="style"
      class="mx-1 mx-sm-2"
      @click="modelValue = s"
    />
  </div>
</template>
