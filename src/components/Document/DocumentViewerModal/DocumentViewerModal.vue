<script setup>
import { computed, ref, toRef, watch } from 'vue'

import DocumentViewerModalTitle from './DocumentViewerModalTitle'
import DocumentViewerModalNav from './DocumentViewerModalNav'

import AppModal from '@/components/AppModal/AppModal'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
import useContrastVariant from '@/composables/useContrastVariant'

const props = defineProps({
  document: {
    type: Object,
    required: true
  }
})

const { variant } = useContrastVariant({ dark: 'darker' })
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
    :body-bg-variant="variant"
    body-class="rounded-bottom"
    :header-variant="variant"
    header-class="document-viewer-modal__header"
    no-footer
    size="lg"
  >
    <template #title>
      <document-viewer-modal-title :document="document" />
    </template>
    <document-viewer-modal-nav v-model:document="document" class="mb-3" />
    <document-thumbnail :key="key" :document="document" fit size="md" class="mx-auto" />
  </app-modal>
</template>
