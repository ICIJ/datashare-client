<script setup>
import { computed } from 'vue'

import categories from '@/utils/contentTypeCategories.json'

const props = defineProps({
  value: {
    type: String
  }
})

// Resolve the human-readable category label; fall back to the raw key
// when the value doesn't match any known category.
const label = computed(() => {
  return categories[props.value]?.label ?? props.value
})
</script>

<template>
  <span>{{ label }}</span>
</template>
