<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayExtractionLevel from '@/components/Display/DisplayExtractionLevel'

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
  <document-card-properties-entry :document="document" :property="property">
    <display-extraction-level :value="document.extractionLevel" />
  </document-card-properties-entry>
</template>
