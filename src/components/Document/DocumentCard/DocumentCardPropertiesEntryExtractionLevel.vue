<script setup>
import { computed } from 'vue'

import { getExtractionLevelTranslationKey } from '@/utils/utils'
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

const props = defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  }
})

const translationKey = computed(() => {
  return getExtractionLevelTranslationKey(props.document.extractionLevel)
})
</script>

<template>
  <document-card-properties-entry :document="document" :property="property" icon="note-blank">
    {{ $t(translationKey) }}
  </document-card-properties-entry>
</template>
