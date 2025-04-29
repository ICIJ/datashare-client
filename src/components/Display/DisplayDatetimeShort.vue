<script setup>
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { FORMAT_SHORT } from '@/utils/humanDate'

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
  <display-datetime :value="value" :format="FORMAT_SHORT" :no-tooltip="noTooltip" />
</template>
