<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { humanLongDate } from '@/utils/humanDate'
import { humanTime } from '@/utils/humanTime'

const { locale } = useI18n()

const props = defineProps({
  value: {
    type: [String, Number, Date],
    required: true
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  },
  noTooltip: {
    type: Boolean
  }
})

const title = computed(() => {
  if (!props.noTooltip) {
    return humanLongDate(props.value, locale.value)
  }
  return null
})

const display = computed(() => {
  if (!props.value) {
    return ''
  }

  return humanTime(props.value, locale.value)
})
</script>

<template>
  <span
    v-b-tooltip.body="{ delay: tooltipDelay }"
    class="display-time d-inline-flex align-items-center flex-wrap"
    :title="title"
    aria-label="time"
  >
    <slot v-bind="{ display }">
      {{ display }}
    </slot>
  </span>
</template>
