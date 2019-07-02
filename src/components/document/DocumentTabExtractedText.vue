<template>
  <div class="document__extracted-text">
    <document-translated-content :document="document" :named-entities="namedEntities" />
  </div>
</template>

<script>
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent.vue'

export default {
  name: 'DocumentTabExtractedText',
  props: ['document', 'namedEntities'],
  components: {
    DocumentTranslatedContent
  }
}
</script>
