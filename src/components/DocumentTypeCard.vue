<template>
  <div class="document-type-card">
    <document-thumbnail :document="document" class="float-left mr-2 mb-2" crop />
    <p class="m-0">
      {{ localizedDescription }}
      <strong v-if="!document.hasStandardExtension" class="font-weight-bold" v-html="$t('search.nav.document.extensionWarning', { extension: document.standardExtension })"></strong>
    </p>
    <p class="bg-warning mb-0 mt-4 p-2" v-if="document.hasContentTypeWarning">
      <fa icon="exclamation-triangle" class="mr-1" />
      {{ localizedContentTypeWarning }}
    </p>
  </div>
</template>

<script>
import DocumentThumbnail from './DocumentThumbnail.vue'

export default {
  name: 'DocumentTypeCard',
  props: ['document'],
  components: {
    DocumentThumbnail
  },
  computed: {
    localizedDescription () {
      const descriptions = this.document.contentTypeDescription
      return descriptions[this.$i18n.locale] || descriptions['en']
    },
    localizedContentTypeWarning () {
      const warnings = this.document.contentTypeWarning
      return warnings[this.$i18n.locale] || warnings['en']
    }
  }
}
</script>
