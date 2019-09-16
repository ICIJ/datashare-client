<template>
  <div class="document__extracted-text">
    <template v-if="document.isEmail">
      <document-thread :document="document" :named-entities="namedEntities" />
    </template>
    <template v-else>
      <document-translated-content :document="document" :named-entities="namedEntities" />
    </template>
  </div>
</template>

<script>
import DocumentTranslatedContent from '@/components/DocumentTranslatedContent'
import DocumentThread from '@/components/DocumentThread'

export default {
  name: 'DocumentTabExtractedText',
  props: {
    document: Object,
    namedEntities: {
      type: Array,
      default: () => ([])
    }
  },
  components: {
    DocumentTranslatedContent,
    DocumentThread
  }
}
</script>
