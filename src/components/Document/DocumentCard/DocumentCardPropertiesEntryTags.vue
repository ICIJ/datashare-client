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
  <document-card-properties-entry :document="document" :property="property" icon="hash">
    <display-tags :value="document.tags" v-if="document.tags.length" />
    <template v-else>&#8212;</template>
  </document-card-properties-entry>
</template>
