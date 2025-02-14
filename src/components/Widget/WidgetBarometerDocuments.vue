<template>
  <widget-barometer class="widget-barometer-documents" :icon="icon" :label="label">
    {{ value }}
  </widget-barometer>
</template>

<script setup>
import { useI18n } from 'vue-i18n'
import { computed } from 'vue'

import WidgetBarometer from '@/components/Widget/WidgetBarometer'
import humanNumber from '@/utils/humanNumber'

const props = defineProps({
  nbDocuments: { type: Number },
  nbDocumentsOnDisks: { type: Number }
})

const { t } = useI18n()
const icon = 'files'

const label = computed(() => {
  return `${t('widget.barometer.amongWhich')} ${props.nbDocumentsOnDisks} ${t('widget.barometer.onDisk')}`
})

const humanNbDocs = computed(() => {
  return humanNumber(props.nbDocuments)
})

const value = computed(() => {
  const n = props.nbDocuments
  const value = humanNbDocs.value
  return t('widget.barometer.document', { n, value })
})
</script>
