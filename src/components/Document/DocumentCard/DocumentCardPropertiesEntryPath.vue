<script setup>
import DisplayPath from '@/components/Display/DisplayPath'
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
  <document-card-properties-entry
    :document="document"
    :property="property"
  >
    <display-path :value="document.path" />
  </document-card-properties-entry>
</template>
