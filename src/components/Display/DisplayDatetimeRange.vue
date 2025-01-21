<script setup>
import { isArray } from 'lodash'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayDatetime from './DisplayDatetime'

import { FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW, humanLongDate } from '@/utils/humanDate'

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

const { t, locale } = useI18n()

const title = computed(() => {
  const humanStart = humanLongDate(start.value, locale.value)
  const humanEnd = humanLongDate(end.value, locale.value)
  return t('displayDatetimeRange.title', { start: humanStart, end: humanEnd })
})
</script>

<template>
  <span v-b-tooltip.body class="display-datetime-range" :title="title">
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
