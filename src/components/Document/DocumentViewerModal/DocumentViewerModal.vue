<script setup>
import { computed, ref, toRef, watch } from 'vue'

import DocumentViewerModalTitle from './DocumentViewerModalTitle'
import DocumentViewerModalNav from './DocumentViewerModalNav'

import AppModal from '@/components/AppModal/AppModal'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const document = ref(props.document)
// Document ref must stay in sync with the prop
watch(toRef(props, 'document'), () => (document.value = props.document))
// We track this compositive document key to force the thumbnail to re-render when the document changes
const key = computed(() => [document.value.index, document.value.id])
</script>

<template>
  <app-modal
    class="document-viewer-modal"
    content-class="shadow-none"
    body-bg-variant="light"
    body-class="rounded-bottom"
    header-variant="light"
    header-class="document-viewer-modal__header"
    hide-footer
    size="lg"
  >
    <template #title>
      <document-viewer-modal-title :document="document" />
    </template>
    <document-thumbnail :key="key" :document="document" fit class="d-inline-flex mx-auto mb-3" />
    <document-viewer-modal-nav v-model:document="document" />
  </app-modal>
</template>
