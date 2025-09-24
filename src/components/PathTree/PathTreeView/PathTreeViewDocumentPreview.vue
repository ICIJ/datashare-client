<script setup>
import { computed } from 'vue'

import Document from '@/api/resources/Document'
import DocumentThumbnail from '@/components/Document/DocumentThumbnail/DocumentThumbnail'

const props = defineProps({
  /**
   * Document or entry object to render
   */
  entry: {
    type: Object,
    required: true
  }
})

const document = computed(() => {
  return props.entry instanceof Document ? props.entry : Document.create(props.entry)
})
</script>

<template>
  <div class="path-tree-view-document-preview rounded-bottom">
    <document-thumbnail
      class="path-tree-view-document-preview__thumbnail"
      size="lg"
      :clickable="false"
      :document="document"
    />
  </div>
</template>

<style lang="scss" scoped>
.path-tree-view-document-preview {
  background: transparent;
  border-top: 1px solid var(--bs-border-color);
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow: hidden;
  padding: $spacer;
}
</style>
