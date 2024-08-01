<script setup>
import { computed } from 'vue'

import DisplayDatetime from './DisplayDatetime'

import { FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW } from '@/utils/humanDate'

const props = defineProps({
  value: {
    type: Array
  },
  format: {
    type: String,
    default: FORMAT_SHORT,
    validator: (value) => [FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW].includes(value)
  }
})

const start = computed(() => {
  return props.value[0]
})

const end = computed(() => {
  return props.value[1]
})
</script>

<template>
  <span class="display-datetime-range">
    <display-datetime :value="start" :format="format" />
    <display-datetime :value="end" :format="format" />
  </span>
</template>

<style lang="scss" scoped>
.display-datetime-range {
  display: inline-flex;
  align-items: center;

  &:deep(.display-datetime:not(:last-of-type):after) {
    content: '-';
    margin: 0 $spacer-xs;
  }
}
</style>
