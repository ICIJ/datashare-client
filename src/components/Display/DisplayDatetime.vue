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

const { locale } = useI18n()

const props = defineProps({
  value: {
    type: [String, Number, Date],
    required: true
  },
  format: {
    type: String,
    default: FORMAT_SHORT,
    validator: (value) => [FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW].includes(value)
  },
  noTooltip: {
    type: Boolean
  }
})

const title = computed(() => {
  if (!props.noTooltip && props.format !== FORMAT_LONG) {
    return humanLongDate(props.value, locale.value)
  }
  return null
})

const display = computed(() => {
  if (!props.value) {
    return ''
  }

  switch (props.format) {
    case FORMAT_MONTH:
      return humanMonthDate(props.value, locale.value)
    case FORMAT_LONG:
      return humanLongDate(props.value, locale.value)
    case FORMAT_FROM_NOW:
      return fromNow(props.value, locale.value)
    default:
      return humanShortDate(props.value, locale.value)
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
