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
import DocumentCardPropertiesEntryNumberOfPages from './DocumentCardPropertiesEntryNumberOfPages'

import { useSearchProperties } from '@/composables/useSearchProperties'

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
  tags: DocumentCardPropertiesEntryTags,
  numberOfPages: DocumentCardPropertiesEntryNumberOfPages
}

const props = defineProps({
  document: {
    type: Object
  },
  properties: {
    type: Array
  }
})

const { fields } = useSearchProperties()

const visibleFields = computed(() => {
  return fields.filter((field) => {
    return field.required || props.properties.includes(field.key)
  })
})
</script>

<template>
  <div class="document-card-properties text-break">
    <component
      :is="entryComponents[key]"
      v-for="{ key } in visibleFields"
      :key="key"
      :document="document"
      :property="key"
    />
  </div>
</template>
