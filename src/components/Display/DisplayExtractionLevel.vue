<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import { getExtractionLevelTranslationKey } from '@/utils/utils'

const props = defineProps({
  value: {
    type: [String, Number]
  }
})
const { t } = useI18n()

const translationKey = computed(() => {
  return getExtractionLevelTranslationKey(parseInt(props.value))
})
</script>

<template>
  <span>{{ t(translationKey) }}</span>
</template>
