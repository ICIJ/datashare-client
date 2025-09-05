<script setup>
import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { FORMAT_MONTH } from '@/utils/humanDate'

defineProps({
  value: {
    type: [String, Number, Date],
    default: null
  }
})
</script>

<template>
  <display-datetime
    :value="value"
    :format="FORMAT_MONTH"
    no-tooltip
  />
</template>
