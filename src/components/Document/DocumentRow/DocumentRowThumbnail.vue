<script setup>
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'
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
    <document-thumbnail
      :document="document"
      class="above-stretched-link"
      crop
      lazy
      clickable
      size="xs"
      @click="showDocumentViewerModal"
    />
  </td>
</template>
