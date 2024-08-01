<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayDatetime from './DisplayDatetime'

import { FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW, humanLongDate } from '@/utils/humanDate'

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

const { t, locale } = useI18n()

const title = computed(() => {
  const humanStart = humanLongDate(start.value, locale.value)
  const humanEnd = humanLongDate(end.value, locale.value)
  return t('displayDatetimeRange.title', { start: humanStart, end: humanEnd })
})
</script>

<template>
  <span class="display-datetime-range" :title="title" v-b-tooltip.body>
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
