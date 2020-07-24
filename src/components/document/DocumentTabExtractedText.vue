<template>
  <div class="document__extracted-text">
    <document-notes :path="document.path"></document-notes>
    <template v-if="document.isEmail">
      <document-thread :document="document"></document-thread>
    </template>
    <template v-else>
      <document-translated-content :document="document"></document-translated-content>
    </template>
  </div>
</template>

<script>
import DocumentNotes from '@/components/document/DocumentNotes'
import DocumentThread from '@/components/DocumentThread'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

/**
 * A panel displaying the extracted text of a document.
 */
export default {
  name: 'DocumentTabExtractedText',
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    }
  },
  components: {
    DocumentNotes,
    DocumentThread,
    DocumentTranslatedContent
  }
}
</script>
