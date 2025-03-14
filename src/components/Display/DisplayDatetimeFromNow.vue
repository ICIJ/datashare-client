<script setup>
import DisplayDatetime from './DisplayDatetime'

import { FORMAT_FROM_NOW } from '@/utils/humanDate'

defineProps({
  value: {
    type: [String, Number, Date],
    default: null
  },
  noTooltip: {
    type: Boolean
  }
})
</script>

<template>
  <display-datetime :value="value" :format="FORMAT_FROM_NOW" :no-tooltip="noTooltip" />
</template>
