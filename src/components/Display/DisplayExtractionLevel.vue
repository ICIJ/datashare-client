<script setup>
import { computed } from 'vue'

import { getExtractionLevelTranslationKey } from '@/utils/utils'

const props = defineProps({
  value: {
    type: [String, Number]
  }
})

const translationKey = computed(() => {
  return getExtractionLevelTranslationKey(parseInt(props.value))
})
</script>

<template>
  <span>{{ $t(translationKey) }}</span>
</template>
