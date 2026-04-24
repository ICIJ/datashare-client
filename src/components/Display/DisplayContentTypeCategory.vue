<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  value: {
    type: String,
    required: true
  }
})

const { t, te } = useI18n()

// Resolve the human-readable label via i18n; fall back to the raw key
// when the value doesn't match any registered category translation.
const label = computed(() => {
  const key = `filter.contentTypeCategory.${props.value}`
  return te(key) ? t(key) : props.value
})
</script>

<template>
  <span>{{ label }}</span>
</template>
