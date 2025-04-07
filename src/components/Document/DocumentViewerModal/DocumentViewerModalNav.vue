<script setup>
import DocumentSearchNav from '@/components/Document/DocumentSearchNav/DocumentSearchNav'
import { useSearchNav } from '@/composables/useSearchNav'

const document = defineModel('document', { type: Object, required: true })
const { fetchNextDocument, fetchPreviousDocument, isDocumentInPage, disabledPrevious, disabledNext } = useSearchNav(document)

const previous = async () => {
  document.value = await fetchPreviousDocument()
}

const next = async () => {
  document.value = await fetchNextDocument()
}
</script>

<template>
  <div class="document-viewer-modal-nav text-center">
    <document-search-nav
      v-if="isDocumentInPage"
      class="border"
      :disabled-previous="disabledPrevious"
      :disabled-next="disabledNext"
      @previous="previous"
      @next="next"
    />
  </div>
</template>
