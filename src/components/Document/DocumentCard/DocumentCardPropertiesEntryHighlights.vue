<script setup>
import DisplayHighlights from '@/components/Display/DisplayHighlights'
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
    class="document-card-properties-entry-highlights"
    :document="document"
    :property="property"
  >
    <display-highlights
      v-if="document.highlights.length"
      :value="document.highlights"
    />
    <template v-else>
      &#8212;
    </template>
  </document-card-properties-entry>
</template>

<style scoped>
.document-card-properties-entry-highlights {
  white-space: wrap;
}
</style>
