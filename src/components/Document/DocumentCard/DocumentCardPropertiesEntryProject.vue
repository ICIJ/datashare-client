<script setup>
import DocumentCardPropertiesEntry from '@/components/Document/DocumentCard/DocumentCardPropertiesEntry'
import ProjectButton from '@/components/Project/ProjectButton'

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
  <document-card-properties-entry :document="document" :property="property" icon="circles-three-plus" hide-icon>
    <project-button :project="document.project" no-link disabled />
  </document-card-properties-entry>
</template>
