<script setup>
import IPhHash from '~icons/ph/hash'

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
  <document-card-properties-entry
    :document="document"
    :property="property"
    :icon="IPhHash"
  >
    <display-tags
      v-if="document.tags.length"
      :value="document.tags"
    />
    <template v-else>
      &#8212;
    </template>
  </document-card-properties-entry>
</template>
