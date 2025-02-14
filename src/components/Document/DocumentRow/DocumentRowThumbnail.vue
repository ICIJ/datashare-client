<script setup>
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'
import { useDocumentViewerModal } from '@/composables/document'

const props = defineProps({
  document: {
    type: Object
  }
})

const { show: showDocumentViewerModal } = useDocumentViewerModal(props.document)
</script>

<template>
  <td>
    <document-thumbnail
      :document="document"
      crop
      lazy
      clickable
      :size="32"
      :active="hover"
      @click="showDocumentViewerModal"
    />
  </td>
</template>
