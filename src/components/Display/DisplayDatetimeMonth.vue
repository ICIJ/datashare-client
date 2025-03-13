<script setup>
import { computed } from 'vue'

import DisplayDatetime from '@/components/Display/DisplayDatetime'
import { FORMAT_MONTH } from '@/utils/humanDate'

const props = defineProps({
  value: {
    type: [String, Number, Date],
    required: true
  }
})
</script>

<template>
  <display-datetime :value="value" :format="FORMAT_MONTH" no-tooltip />
</template>
