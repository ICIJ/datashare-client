<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  }
})
</script>

<template>
  <document-card-properties-entry :document="document" :property="property" icon="text-columns">
    {{ $n(document.contentTextLength) }}
  </document-card-properties-entry>
</template>
