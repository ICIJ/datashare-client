<script setup>
import { FORMAT_SHORT } from '@/utils/humanDate'

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
  <display-datetime :value="props.value" :format="FORMAT_SHORT" :no-tooltip="props.noTooltip" />
</template>
