<template>
  <div class="document-type-card d-flex">
    <document-thumbnail :document="document" class="mr-2 mb-2" crop></document-thumbnail>
    <div>
      <p class="m-0">
        {{ localizedDescription }}
        <strong v-if="!document.hasStandardExtension" class="font-weight-bold" v-html="$t('search.nav.document.extensionWarning', { extension: document.standardExtension })"></strong>
      </p>
      <p class="bg-warning mb-0 mt-2 p-2 text-dark" v-if="document.hasContentTypeWarning">
        <fa icon="exclamation-triangle" class="mr-1"></fa>
        {{ localizedContentTypeWarning }}
      </p>
    </div>
  </div>
</template>

<script>
import DocumentThumbnail from '@/components/DocumentThumbnail'

/**
 * A small card to display information about the content-type of a document.
 */
export default {
  name: 'DocumentTypeCard',
  props: {
    /**
     * The selected document.
     */
    document: {
      type: Object
    }
  },
  components: {
    DocumentThumbnail
  },
  computed: {
    localizedDescription () {
      const descriptions = this.document.contentTypeDescription
      return descriptions[this.$i18n.locale] || descriptions.en
    },
    localizedContentTypeWarning () {
      const warnings = this.document.contentTypeWarning
      return warnings[this.$i18n.locale] || warnings.en
    }
  }
}
</script>
