<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayContentType from '@/components/Display/DisplayContentType'

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
    <display-content-type :value="document.contentType" />
  </document-card-properties-entry>
</template>
