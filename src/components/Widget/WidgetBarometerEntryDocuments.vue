<template>
  <widget-barometer-entry :icon="icon" :label="label" :to="to">{{ value }}</widget-barometer-entry>
</template>

<script setup>
import { useI18n } from 'vue-i18n'

import WidgetBarometerEntry from '@/components/Widget/WidgetBarometerEntry'
import humanNumber from '@/utils/humanNumber'
const props = defineProps({
  nbDocuments: { type: Number },
  nbDocumentsOnDisks: { type: Number }
})
const { t } = useI18n()
const icon = 'files'
const to = `#`
const label = `${t('widget.barometer.amongWhich')} ${props.nbDocumentsOnDisks} ${t('widget.barometer.onDisk')}`
const humanNbDocs = humanNumber(props.nbDocuments)
const value = t('widget.barometer.document', { n: props.nbDocuments, value: humanNbDocs })
</script>
