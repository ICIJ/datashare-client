<script setup>
import { computed } from 'vue'

import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'

const props = defineProps({
  document: {
    type: Object
  },
  property: {
    type: String
  }
})

const tags = computed(() => {
  const toHashtag = (tag) => `#${tag}`
  return props.document.tags.map(toHashtag).join(' ')
})
</script>

<template>
  <document-card-properties-entry :document="document" :property="property" icon="tag">
    {{ tags }}
  </document-card-properties-entry>
</template>
