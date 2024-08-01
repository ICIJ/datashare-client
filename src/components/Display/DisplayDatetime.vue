<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  FORMAT_SHORT,
  FORMAT_MONTH,
  FORMAT_LONG,
  FORMAT_FROM_NOW,
  humanMonthDate,
  humanLongDate,
  humanShortDate,
  fromNow
} from '@/utils/humanDate'

const props = defineProps({
  value: {
    type: [String, Number, Date],
    required: true
  },
  format: {
    type: String,
    default: FORMAT_SHORT,
    validator: (value) => [FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW].includes(value)
  }
})

const title = computed(() => {
  if (props.format !== FORMAT_LONG) {
    return humanLongDate(props.value, useI18n().locale.value)
  }
  return null
})

const display = computed(() => {
  if (!props.value) {
    return ''
  }

  switch (props.format) {
    case FORMAT_MONTH:
      return humanMonthDate(props.value, useI18n().locale.value)
    case FORMAT_LONG:
      return humanLongDate(props.value, useI18n().locale.value)
    case FORMAT_FROM_NOW:
      return fromNow(props.value, useI18n().locale.value)
    default:
      return humanShortDate(props.value, useI18n().locale.value)
  }
})
</script>

<template>
  <span
    v-b-tooltip.body
    class="display-datetime d-inline-flex align-items-center flex-wrap"
    :title="title"
    aria-label="datetime"
  >
    <slot v-bind="{ display }">
      {{ display }}
    </slot>
  </span>
</template>
