<script setup>
import { computed } from 'vue'

import { useContentTypeCategoryLabel } from '@/composables/useContentTypeCategoryLabel'

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const categoryLabel = useContentTypeCategoryLabel()
const label = computed(() => categoryLabel(props.value))
</script>

<template>
  <span>{{ label }}</span>
</template>
