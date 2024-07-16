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
  <document-card-properties-entry :document="document" :property="property" icon="circles-three-plus" hide-icon>
    {{ document.project }}
  </document-card-properties-entry>
</template>
