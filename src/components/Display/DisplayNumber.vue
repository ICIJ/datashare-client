<script setup>
import { computed } from 'vue'
import round from 'lodash/round'

const props = defineProps({
  value: {
    type: Number,
    default: null
  },
  precision: {
    type: Number,
    default: null
  }
})

const roundedValue = computed(() => {
  if (props.precision === null) {
    return props.value
  }
  return round(props.value, props.precision)
})
</script>

<template>
  <span v-if="!isNaN(value)">{{ $n(roundedValue) }}</span>
</template>
