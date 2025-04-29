<script setup>
import { computed } from 'vue'

import DocumentRowActions from './DocumentRowActions'
import DocumentRowAuthor from './DocumentRowAuthor'
import DocumentRowContentLength from './DocumentRowContentLength'
import DocumentRowContentTextLength from './DocumentRowContentTextLength'
import DocumentRowContentType from './DocumentRowContentType'
import DocumentRowCreationDate from './DocumentRowCreationDate'
import DocumentRowExtractionLevel from './DocumentRowExtractionLevel'
import DocumentRowHighlights from './DocumentRowHighlights'
import DocumentRowLanguage from './DocumentRowLanguage'
import DocumentRowPath from './DocumentRowPath'
import DocumentRowProject from './DocumentRowProject'
import DocumentRowTags from './DocumentRowTags'
import DocumentRowTitle from './DocumentRowTitle'
import DocumentRowThumbnail from './DocumentRowThumbnail'

import PageTableTr from '@/components/PageTable/PageTableTr'
import { useSearchProperties } from '@/composables/useSearchProperties'

const entryComponents = {
  author: DocumentRowAuthor,
  contentLength: DocumentRowContentLength,
  contentTextLength: DocumentRowContentTextLength,
  contentType: DocumentRowContentType,
  creationDate: DocumentRowCreationDate,
  extractionLevel: DocumentRowExtractionLevel,
  highlights: DocumentRowHighlights,
  language: DocumentRowLanguage,
  path: DocumentRowPath,
  project: DocumentRowProject,
  tags: DocumentRowTags,
  thumbnail: DocumentRowThumbnail,
  title: DocumentRowTitle
}

const selected = defineModel('selected', { type: Boolean })

const props = defineProps({
  document: {
    type: Object
  },
  properties: {
    type: Array,
    default: () => ['title', 'thumbnail']
  },
  selectMode: {
    type: Boolean
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
  <page-table-tr v-model:selected="selected" class="document-row" :select-mode="selectMode">
    <component :is="entryComponents[key]" v-for="{ key } in visibleFields" :key="key" :document="document" />
    <document-row-actions :document="document" />
  </page-table-tr>
</template>
