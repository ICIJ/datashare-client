<script setup>
import { computed } from 'vue'

import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import { getDocumentTypeLabel } from '@/utils/utils'

const props = defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  }
})

const label = computed(() => {
  return getDocumentTypeLabel(props.document.contentType)
})
</script>

<template>
  <document-card-properties-entry :document="document" :property="property" icon="file-text">
    {{ label }}
  </document-card-properties-entry>
</template>
