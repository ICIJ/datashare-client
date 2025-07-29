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
  <document-card-properties-entry
    :document="document"
    :property="property"
  >
    <display-datetime
      v-if="document.creationDate"
      :value="document.creationDate"
    />
    <template v-else>
      &#8212;
    </template>
  </document-card-properties-entry>
</template>
