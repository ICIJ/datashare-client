<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import humanSize from '@/utils/humanSize'

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
  <document-card-properties-entry :document="document" :property="property" icon="file">
    {{ humanSize(document.contentLength, false, $tm('human.size')) }}
  </document-card-properties-entry>
</template>
