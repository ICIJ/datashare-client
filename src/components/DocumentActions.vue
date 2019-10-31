<template>
  <div class="document-actions" :class="{ 'btn-group-vertical': !noBtnGroup && vertical, 'btn-group': !noBtnGroup && !vertical }">
    <a class="document-actions__star btn" :class="starBtnClassDefinition" href @click.prevent="toggleStarDocument(document.id)" :id="starBtnId">
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !starBtnLabel }">{{ $t('document.star_button') }}</span>
    </a>
    <b-tooltip :target="starBtnId" :placement="tooltipsPlacement">
      {{ $t('document.star_file') }}
    </b-tooltip>
    <a class="document-actions__download btn" :class="downloadBtnClassDefinition" :href="document.fullUrl" target="_blank" v-if="canIDownload" :id="downloadBtnId">
      <fa icon="download" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !downloadBtnLabel }">{{ $t('document.download_button') }}</span>
    </a>
    <b-popover :target="downloadBtnId" triggers="hover focus" :placement="tooltipsPlacement" :title="document.contentTypeLabel">
      <document-type-card :document="document" />
    </b-popover>
    <router-link-popup class="document-actions__popup btn" :class="popupBtnClassDefinition" :to="{ name: 'document-simplified', params: document.routerParams }" :id="popupBtnId">
      <fa icon="external-link-alt" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !popupBtnLabel }">{{ $t('document.external_window') }}</span>
    </router-link-popup>
    <b-tooltip :target="popupBtnId" :placement="tooltipsPlacement">
      {{ $t('document.external_window') }}
    </b-tooltip>
  </div>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import { mapState } from 'vuex'

import DocumentTypeCard from '@/components/DocumentTypeCard'
import RouterLinkPopup from '@/components/RouterLinkPopup'
import features from '@/mixins/features'

export default {
  name: 'DocumentActions',
  components: {
    DocumentTypeCard,
    RouterLinkPopup
  },
  mixins: [features],
  props: {
    document: {
      type: Object
    },
    vertical: {
      type: Boolean
    },
    tooltipsPlacement: {
      type: String,
      default: 'top'
    },
    displayDownload: {
      type: Boolean
    },
    isDownloadAllowed: {
      type: Boolean
    },
    starBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    starredBtnClass: {
      type: String,
      default: 'starred'
    },
    downloadBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    popupBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    starBtnLabel: {
      type: Boolean
    },
    downloadBtnLabel: {
      type: Boolean
    },
    popupBtnLabel: {
      type: Boolean
    },
    noBtnGroup: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('search', ['starredDocuments']),
    starBtnClassDefinition () {
      const starred = this.isStarred(this.document.id)
      return { [this.starredBtnClass]: starred, ...this.classAttributeToObject(this.starBtnClass) }
    },
    downloadBtnClassDefinition () {
      return this.classAttributeToObject(this.downloadBtnClass)
    },
    popupBtnClassDefinition () {
      return this.classAttributeToObject(this.popupBtnClass)
    },
    starBtnId () {
      return uniqueId('document-actions-star-button-')
    },
    downloadBtnId () {
      return uniqueId('document-actions-download-button-')
    },
    popupBtnId () {
      return uniqueId('document-actions-popup-button-')
    },
    canIDownload () {
      return this.hasFeature('DOWNLOAD_ALLOWED') ? this.isDownloadAllowed : true
    }
  },
  methods: {
    classAttributeToObject (str) {
      const list = str.split(' ')
      return Object.assign({}, ...list.map(key => ({ [key]: true })))
    },
    isStarred (documentId) {
      return this.starredDocuments.indexOf(documentId) >= 0
    },
    async toggleStarDocument (documentId) {
      try {
        await this.$store.dispatch('search/toggleStarDocument', documentId)
      } catch (_) {
        this.$bvToast.toast(this.$t('document.starring_error'), { noCloseButton: true, variant: 'danger' })
      }
      this.$root.$emit('bv::hide::tooltip')
      this.$root.$emit('facet::starred::refresh')
    }
  }
}
</script>
