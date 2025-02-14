<script setup>
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { FORMAT_MONTH } from '@/utils/humanDate'

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
  <display-datetime :value="props.value" :format="FORMAT_MONTH" :no-tooltip="props.noTooltip" />
</template>
