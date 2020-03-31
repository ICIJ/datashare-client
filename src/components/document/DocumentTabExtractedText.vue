<template>
  <div class="document__extracted-text">
    <document-notes :path="document.path" />
    <template v-if="document.isEmail">
      <document-thread :document="document" />
    </template>
    <template v-else>
      <document-translated-content :document="document" />
    </template>
  </div>
</template>

<script>
import DocumentNotes from '@/components/document/DocumentNotes'
import DocumentThread from '@/components/DocumentThread'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'

export default {
  name: 'DocumentTabExtractedText',
  props: {
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
