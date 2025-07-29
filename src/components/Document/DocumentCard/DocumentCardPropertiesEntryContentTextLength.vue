<script setup>
import { useI18n } from 'vue-i18n'

import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  }
})
const { n } = useI18n()
</script>

<template>
  <document-card-properties-entry
    :document="document"
    :property="property"
  >
    {{ n(document.contentTextLength) }}
  </document-card-properties-entry>
</template>
