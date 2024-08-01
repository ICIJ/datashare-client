<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayTags from '@/components/Display/DisplayTags'

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
  <document-card-properties-entry :document="document" :property="property" icon="tag">
    <display-tags :model-value="document.tags" />
  </document-card-properties-entry>
</template>
