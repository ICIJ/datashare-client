<script setup>
import DisplayDatetime from './DisplayDatetime'

import { FORMAT_FROM_NOW } from '@/utils/humanDate'

const props = defineProps({
  value: {
    type: [String, Number, Date],
    required: true
  },
  noTooltip: {
    type: Boolean
  }
})
</script>

<template>
  <display-datetime :value="value" :format="FORMAT_FROM_NOW" :no-tooltip="noTooltip" />
</template>
