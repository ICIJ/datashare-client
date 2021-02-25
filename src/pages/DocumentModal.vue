<template>
  <div class="document-modal">
    <document-navbar v-bind="$props" />
    <document-view v-bind="$props" />
  </div>
</template>

<script>
import DocumentNavbar from '@/components/document/DocumentNavbar'
import DocumentView from '@/pages/DocumentView'

export default {
  name: 'DocumentModal',
  components: {
    DocumentNavbar,
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
    }
  }
}
</script>
