<script setup>
import DocumentThumbnail from '@/components/Document/DocumentThumbnail'
import { useDocumentModal } from '@/composables/useDocument'

const props = defineProps({
  document: {
    type: Object
  }
})

const { show: showDocumentViewerModal } = useDocumentModal(props.document)
</script>

<template>
  <td>
    <document-thumbnail :document="document" crop lazy clickable :size="32" @click="showDocumentViewerModal" />
  </td>
</template>
