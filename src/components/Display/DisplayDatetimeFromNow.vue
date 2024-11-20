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
  <display-datetime :value="props.value" :format="FORMAT_FROM_NOW" :no-tooltip="props.noTooltip" />
</template>
