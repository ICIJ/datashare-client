<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayDatetime from '@/components/Display/DisplayDatetime'

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
  <document-card-properties-entry :document="document" :property="property" icon="calendar">
    <display-datetime :value="document.creationDate" />
  </document-card-properties-entry>
</template>
