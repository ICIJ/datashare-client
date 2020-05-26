<template>
  <div class="document-actions" :class="{ 'btn-group-vertical': !noBtnGroup && vertical, 'btn-group': !noBtnGroup && !vertical }">
    <a class="document-actions__star btn" :class="starBtnClassDefinition" href @click.prevent="toggleStarDocument(document.id)" :id="starBtnId">
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !starBtnLabel }">{{ $t('document.starButton') }}</span>
    </a>
    <b-tooltip :target="starBtnId" :placement="tooltipsPlacement">
      {{ $t('document.starFile') }}
    </b-tooltip>
    <a class="document-actions__download btn" :class="downloadBtnClassDefinition" :href="document.fullUrl" target="_blank" v-if="canIDownload" :id="downloadBtnId">
      <fa icon="download" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !downloadBtnLabel }">{{ $t('document.downloadButton') }}</span>
    </a>
    <b-popover :target="downloadBtnId" triggers="hover focus" :placement="tooltipsPlacement" :title="document.contentTypeLabel">
      <document-type-card :document="document" />
    </b-popover>
    <router-link-popup class="document-actions__popup btn" :class="popupBtnClassDefinition" :to="{ name: 'document-simplified', params: document.routerParams }" :id="popupBtnId">
      <fa icon="external-link-alt" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !popupBtnLabel }">{{ $t('document.externalWindow') }}</span>
    </router-link-popup>
    <b-tooltip :target="popupBtnId" :placement="tooltipsPlacement">
      {{ $t('document.externalWindow') }}
    </b-tooltip>
  </div>
</template>

<script>
import uniqueId from 'lodash/uniqueId'
import { mapState } from 'vuex'

import DocumentTypeCard from '@/components/DocumentTypeCard'
import RouterLinkPopup from '@/components/RouterLinkPopup'
import features from '@/mixins/features'

/**
 * A list actions to apply to a document
 */
export default {
  name: 'DocumentActions',
  components: {
    DocumentTypeCard,
    RouterLinkPopup
  },
  mixins: [features],
  props: {
    /**
     * The selected document
     */
    document: {
      type: Object
    },
    /**
     * Use a vertical layout
     */
    vertical: {
      type: Boolean
    },
    /**
     * Tooltip's placement on each action
     * @values auto, top, bottom, left, right, topleft, topright, bottomleft, bottomright, lefttop, leftbottom, righttop, rightbottom
     */
    tooltipsPlacement: {
      type: String,
      default: 'top'
    },
    /**
     * Show the download button
     */
    displayDownload: {
      type: Boolean
    },
    /**
     * True if download is allowed for the document
     */
    isDownloadAllowed: {
      type: Boolean
    },
    /**
     * Class to apply to the starring button
     */
    starBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    /**
     * Class to apply to the starring button when document is starred
     */
    starredBtnClass: {
      type: String,
      default: 'starred'
    },
    /**
     * Class to apply to the download button
     */
    downloadBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    /**
     * Class to apply to the popup button
     */
    popupBtnClass: {
      type: String,
      default: 'btn-link btn-sm'
    },
    /**
     * Show label for the starring button
     */
    starBtnLabel: {
      type: Boolean
    },
    /**
     * Show label for the download button
     */
    downloadBtnLabel: {
      type: Boolean
    },
    /**
     * Show label for the popup button
     */
    popupBtnLabel: {
      type: Boolean
    },
    /**
     * Disable the use of button group arround each button
     */
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
        this.$bvToast.toast(this.$t('document.starringError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$root.$emit('bv::hide::tooltip')
      this.$root.$emit('filter::starred::refresh')
    }
  }
}
</script>
