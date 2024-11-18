<template>
  <div class="document-modal">
    <document-view v-bind="$props" />
  </div>
</template>

<script>
import DocumentView from '@/views/Document/DocumentView/DocumentView'

export default {
  name: 'DocumentModal',
  components: {
    DocumentView
  },
  props: {
    id: {
      type: String
    },
    routing: {
      type: String
    },
    index: {
      type: String
    },
    /**
     * Local search query inside the extracted text.
     */
    q: {
      type: String,
      default: ''
    }
  }
}
</script>
