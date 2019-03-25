<template>
  <div class="image-viewer m-auto p-3">
    <document-thumbnail :document="document" size="xl" class="d-inline-block" />
  </div>
</template>

<script>
import DocumentThumbnail from '@/components/DocumentThumbnail'

export default {
  name: 'ImageViewer',
  components: { DocumentThumbnail },
  props: {
    document: {
      type: Object
    }
  }
}
</script>
