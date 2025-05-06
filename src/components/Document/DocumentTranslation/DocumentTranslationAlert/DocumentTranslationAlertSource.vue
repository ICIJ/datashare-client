<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

import DisplayLanguage from '@/components/Display/DisplayLanguage'

const props = defineProps({
  detectedLanguage: {
    type: String,
    required: true
  },
  sourceLanguage: {
    type: String,
    required: true
  },
  tooltipDelay: {
    type: Object,
    default: () => ({ show: 0, hide: 0 })
  }
})

const { t } = useI18n()

const title = computed(() => {
  return t('filter.lang.' + props.detectedLanguage)
})
</script>

<template>
  <span v-if="detectedLanguage === sourceLanguage" v-b-tooltip.body="{ delay: tooltipDelay }" :title="title">
    {{ t('documentTranslationAlertSource.detected') }}
  </span>
  <display-language v-else :value="sourceLanguage" />
</template>
