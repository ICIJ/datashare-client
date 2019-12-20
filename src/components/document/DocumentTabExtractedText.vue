<template>
  <div class="document__extracted-text">
    <document-alert />
    <template v-if="document.isEmail">
      <document-thread :document="document" />
    </template>
    <template v-else>
      <document-translated-content :document="document" />
    </template>
  </div>
</template>

<script>
import DocumentAlert from '@/components/document/DocumentAlert'
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'
import DocumentThread from '@/components/DocumentThread'

export default {
  name: 'DocumentTabExtractedText',
  props: {
    document: Object
  },
  components: {
    DocumentAlert,
    DocumentTranslatedContent,
    DocumentThread
  }
}
</script>
