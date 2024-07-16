<script setup>
import { computed } from 'vue'

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
  return `filter.lang.${props.document.language}`
})
</script>

<template>
  <document-card-properties-entry :document="document" :property="property" icon="globe-hemisphere-west">
    {{ $t(translationKey) }}
  </document-card-properties-entry>
</template>
