<script setup>
import { computed, defineAsyncComponent } from 'vue'

import { useFeatures } from '@/composables/features'
import { useDocument } from '@/composables/document'

const { document } = useDocument()
const { hasFeature } = useFeatures()

const paginatedTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'text/html'
]

const isPaginated = computed(() => {
  return paginatedTypes.includes(document.value.contentType)
})

const previewComponent = computed(() => {
  switch (true) {
    case document.value.isJson:
      return 'DocumentViewerJson'
    case isPaginated.value:
      return 'DocumentViewerPaginated'
    case document.value.isTiff:
      return 'DocumentViewerTiff'
    case document.value.isSpreadsheet && hasFeature('SERVER_RENDERING_SPREADSHEET'):
      return 'DocumentViewerSpreadsheet'
    case document.value.isSpreadsheet:
      return 'DocumentViewerLegacySpreadsheet'
    case document.value.isImage:
      return 'DocumentViewerImage'
    case document.value.isAudio:
      return 'DocumentViewerAudio'
    case document.value.isVideo:
      return 'DocumentViewerVideo'
    default:
      return null
  }
})

const asyncPreviewComponent = computed(() => {
  const componentName = previewComponent.value
  if (componentName) {
    return defineAsyncComponent(() => {
      return import(`@/components/Document/DocumentViewer/${componentName}.vue`)
    })
  }
  return null
})
</script>

<template>
  <div class="d-flex flex-grow-1 document__preview">
    <template v-if="previewComponent">
      <component :is="asyncPreviewComponent" :document="document" />
    </template>
    <template v-else>
      <div class="p-3 text-center flex-grow-1">
        {{ $t('document.notAvailable') }}
      </div>
    </template>
  </div>
</template>
