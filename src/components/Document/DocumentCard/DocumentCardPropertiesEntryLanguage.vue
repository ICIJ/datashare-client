<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayLanguage from '@/components/Display/DisplayLanguage'

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
    <display-language :value="document.language" />
  </document-card-properties-entry>
</template>
