<script setup>
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
    v-if="document.highlights.length"
    class="document-card-properties-entry-highlights"
    :document="document"
    :property="property"
  >
    <div v-html="document.highlights.join(' … ')"></div>
  </document-card-properties-entry>
</template>

<style scoped>
.document-card-properties-entry-highlights {
  white-space: wrap;
  word-break: break-all;
}
</style>
