<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  value: {
    type: String
  }
})
const { t } = useI18n()

const translationKey = computed(() => {
  return `filter.lang.${props.value.toUpperCase()}`
})
</script>

<template>
  <span>{{ t(translationKey) }}</span>
</template>
