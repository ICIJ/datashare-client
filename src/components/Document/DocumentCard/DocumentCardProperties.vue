<script setup>
import { computed } from 'vue'

import DocumentCardPropertiesEntryAuthor from './DocumentCardPropertiesEntryAuthor'
import DocumentCardPropertiesEntryContentLength from './DocumentCardPropertiesEntryContentLength'
import DocumentCardPropertiesEntryContentTextLength from './DocumentCardPropertiesEntryContentTextLength'
import DocumentCardPropertiesEntryContentType from './DocumentCardPropertiesEntryContentType'
import DocumentCardPropertiesEntryCreationDate from './DocumentCardPropertiesEntryCreationDate'
import DocumentCardPropertiesEntryExtractionLevel from './DocumentCardPropertiesEntryExtractionLevel'
import DocumentCardPropertiesEntryHighlights from './DocumentCardPropertiesEntryHighlights'
import DocumentCardPropertiesEntryLanguage from './DocumentCardPropertiesEntryLanguage'
import DocumentCardPropertiesEntryPath from './DocumentCardPropertiesEntryPath'
import DocumentCardPropertiesEntryProject from './DocumentCardPropertiesEntryProject'
import DocumentCardPropertiesEntryTags from './DocumentCardPropertiesEntryTags'

import { useSearchSettings } from '@/composables/search-settings'

const entryComponents = {
  author: DocumentCardPropertiesEntryAuthor,
  contentLength: DocumentCardPropertiesEntryContentLength,
  contentTextLength: DocumentCardPropertiesEntryContentTextLength,
  contentType: DocumentCardPropertiesEntryContentType,
  creationDate: DocumentCardPropertiesEntryCreationDate,
  extractionLevel: DocumentCardPropertiesEntryExtractionLevel,
  highlights: DocumentCardPropertiesEntryHighlights,
  language: DocumentCardPropertiesEntryLanguage,
  path: DocumentCardPropertiesEntryPath,
  project: DocumentCardPropertiesEntryProject,
  tags: DocumentCardPropertiesEntryTags
}

const props = defineProps({
  document: {
    type: Object
  },
  properties: {
    type: Array
  }
})

const { propertiesOrder } = useSearchSettings()

const availableProperties = computed(() => {
  return propertiesOrder.filter((property) => {
    return props.properties.includes(property) && property in entryComponents
  })
})
</script>

<template>
  <div class="document-card-properties">
    <component
      :is="entryComponents[property]"
      v-for="property in availableProperties"
      :key="property"
      :document="document"
      :property="property"
    />
  </div>
</template>
