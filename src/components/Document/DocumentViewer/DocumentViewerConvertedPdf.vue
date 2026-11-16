<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentViewerCode from './DocumentViewerCode'
import DocumentViewerPaginated from './DocumentViewerPaginated'
import DocumentViewerPdf from './DocumentViewerPdf'

import { useDocumentPreview } from '@/composables/useDocumentPreview'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

// Previews older than 1.7 cannot convert to PDF but still render these types as thumbnails.
const PAGINATED_CONTENT_TYPES = [
  'application/msword',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
]

const { t } = useI18n()
const { getPdfUrl, isPreviewActivated } = useDocumentPreview()

const failed = ref(false)
const src = computed(() => getPdfUrl(props.document))
const usePdf = computed(() => isPreviewActivated.value && !failed.value)
const isPaginated = computed(() => PAGINATED_CONTENT_TYPES.includes(props.document.contentType))

watch(() => props.document.id, () => {
  failed.value = false
})
</script>

<template>
  <document-viewer-pdf
    v-if="usePdf"
    :document="document"
    :src="src"
    @error="failed = true"
  />
  <document-viewer-paginated
    v-else-if="isPaginated"
    :document="document"
  />
  <document-viewer-code
    v-else-if="document.isCode"
    :document="document"
  />
  <div
    v-else
    class="p-3 text-center flex-grow-1"
  >
    {{ t('document.notAvailable') }}
  </div>
</template>
