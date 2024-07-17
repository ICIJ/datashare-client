<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: {
    type: String
  }
})

const translationKey = computed(() => {
  return `filter.lang.${props.value.toUpperCase()}`
})
</script>

<template>
  {{ $t(translationKey) }}
</template>
