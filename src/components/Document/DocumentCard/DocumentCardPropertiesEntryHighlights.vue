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
  <document-card-properties-entry :document="document" :property="property" icon="quotes">
    <div class="search-results-list-link__fragments" v-html="document.highlights.join(' … ')"></div>
  </document-card-properties-entry>
</template>
