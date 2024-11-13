<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import DisplayTags from '@/components/Display/DisplayTags'

defineProps({
  document: {
    type: Object,
    required: true
  },
  property: {
    type: String
  }
})
</script>

<template>
  <document-card-properties-entry v-if="document.tags.length" :document="document" :property="property" icon="hash">
    <display-tags :value="document.tags" />
  </document-card-properties-entry>
</template>
