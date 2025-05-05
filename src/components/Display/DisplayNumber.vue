<script setup>
import { computed } from 'vue'
import round from 'lodash/round'
import { useI18n } from 'vue-i18n'

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
const { n } = useI18n()

const roundedValue = computed(() => {
  if (props.precision === null) {
    return props.value
  }
  return round(props.value, props.precision)
})
</script>

<template>
  <span v-if="!isNaN(value)">{{ n(roundedValue) }}</span>
</template>
