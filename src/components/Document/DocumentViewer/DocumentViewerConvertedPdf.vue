<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import DocumentViewerPaginated from './DocumentViewerPaginated'
import DocumentViewerPdf from './DocumentViewerPdf'

import { PAGINATED_CONTENT_TYPES } from '@/enums/documentViewerPdf'
import { useDocumentPreview } from '@/composables/useDocumentPreview'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

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
  <div
    v-else
    class="p-3 text-center flex-grow-1"
  >
    {{ t('document.notAvailable') }}
  </div>
</template>
