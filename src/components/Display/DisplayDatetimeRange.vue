<script setup>
import { isArray } from 'lodash'
import { computed } from 'vue'

import DisplayDatetime from './DisplayDatetime'

import { FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW } from '@/utils/humanDate'

const { value } = defineProps({
  value: {
    type: [Array, String]
  },
  format: {
    type: String,
    default: FORMAT_SHORT,
    validator: (value) => [FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW].includes(value)
  }
})

const start = computed(() => {
  return isArray(value) ? value[0] : new Date(value.split(':').map(Number).shift())
})

const end = computed(() => {
  return isArray(value) ? value[1] : new Date(value.split(':').map(Number).pop())
})
</script>

<template>
  <span class="display-datetime-range">
    <display-datetime :value="start" :format="format" no-tooltip />
    <display-datetime :value="end" :format="format" no-tooltip />
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
