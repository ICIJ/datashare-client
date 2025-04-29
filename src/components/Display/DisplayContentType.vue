<script setup>
import { computed } from 'vue'

import { getDocumentTypeLabel } from '@/utils/utils'

const props = defineProps({
  value: {
    type: String
  }
})

const label = computed(() => {
  return getDocumentTypeLabel(props.value)
})
</script>

<template>
  <span>{{ label }}</span>
</template>
