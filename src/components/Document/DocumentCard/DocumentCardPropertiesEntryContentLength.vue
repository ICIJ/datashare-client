<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayContentLength from '@/components/Display/DisplayContentLength'

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
  <document-card-properties-entry
    :document="document"
    :property="property"
  >
    <display-content-length :value="document[property]" />
  </document-card-properties-entry>
</template>
