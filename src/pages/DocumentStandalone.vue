<template>
  <div class="document-standalone">
    <document-navbar v-bind="$props" />
    <document-view v-bind="$props" />
  </div>
</template>

<script>
import DocumentNavbar from '@/components/document/DocumentNavbar'
import DocumentView from '@/pages/DocumentView'

export default {
  name: 'DocumentStandalone',
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

<style lang="scss">
  .document-standalone {
    max-width: 1140px;
    margin: 5vh auto;
    border: $border-color 1px solid;
    border-radius: $border-radius-lg;
    box-shadow: $box-shadow-sm;

    @media (max-width: #{1140px + $app-sidebar-reduced-width}) {
      margin: 0 auto;
      border: 0;
    }

    .document-navbar {
      border-radius: $border-radius-lg $border-radius-lg 0 0;
    }
  }
</style>
