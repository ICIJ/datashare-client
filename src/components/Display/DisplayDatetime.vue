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
    default: null
  },
  format: {
    type: String,
    default: FORMAT_SHORT,
    validator: value => [FORMAT_SHORT, FORMAT_MONTH, FORMAT_LONG, FORMAT_FROM_NOW].includes(value)
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  noTooltip: {
    type: Boolean
  }
})

const date = computed(() => {
  if (props.value === null) {
    return null
  }

  if (!isNaN(props.value)) {
    return new Date(+props.value)
  }

  return new Date(props.value)
})

const title = computed(() => {
  if (!props.noTooltip && props.format !== FORMAT_LONG) {
    return humanLongDate(date.value, locale.value)
  }
  return null
})

const display = computed(() => {
  if (!date.value) {
    return ''
  }

  switch (props.format) {
    case FORMAT_MONTH:
      return humanMonthDate(date.value, locale.value)
    case FORMAT_LONG:
      return humanLongDate(date.value, locale.value)
    case FORMAT_FROM_NOW:
      return fromNow(date.value, locale.value)
    default:
      return humanShortDate(date.value, locale.value)
  }
})
</script>

<template>
  <span
    v-b-tooltip.body="{ delay: tooltipDelay }"
    class="display-datetime d-inline-flex align-items-center flex-wrap"
    :title="title"
    aria-label="datetime"
  >
    <slot v-bind="{ display }">
      {{ display }}
    </slot>
  </span>
</template>
