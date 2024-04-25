<template>
  <component :is="noBtnGroup ? 'div' : 'b-button-group'" :vertical="vertical" class="document-actions align-items-center">
    <a
      :id="starBtnId"
      class="document-actions__star btn"
      :class="starBtnClassDefinition"
      href
      @click.prevent="toggleStarDocument()"
    >
      <fa :icon="[isStarred ? 'fa' : 'far', 'star']" fixed-width />
      <span class="ms-2" :class="{ 'sr-only': !starBtnLabel }">
        {{ $t('document.starButton') }}
      </span>
    </a>
    <b-tooltip :target="starBtnId" :placement="tooltipsPlacement">
      {{ $t('document.starFile') }}
    </b-tooltip>

    <template v-if="canIDownload">
      <span :id="downloadBtnWrapperId">
        <b-button-group :class="downloadBtnGroupClass">
          <b-button
            :id="downloadBtnId"
            class="document-actions__download btn"
            :class="downloadBtnClass"
            :disabled="isRootTooBig"
            :href="document.fullUrl"
            target="_blank"
            variant="transparent"
          >
            <fa icon="download" fixed-width />
            <span class="ms-1" :class="{ 'sr-only': !downloadBtnLabel }">
              {{ $t('document.downloadButton') }}
            </span>
          </b-button>
          <b-tooltip v-if="isRootTooBig" :target="downloadBtnWrapperId" triggers="hover">
            {{ $t('document.downloadMaxRootSizeAlert', { humanMaxRootSize }) }}
          </b-tooltip>
          <b-dropdown v-if="displayDownloadOptions" right toggle-class="py-0" size="sm">
            <b-dropdown-item v-if="hasCleanableContentType" :href="documentFullUrlWithoutMetadata">
              <fa icon="download" class="me-1 text-secondary" fixed-width />
              {{ $t('document.downloadWithoutMetadata') }}
            </b-dropdown-item>
            <b-dropdown-item class="document-actions__download--extracted-text" @click="documentOriginalExtractedText">
              <fa icon="download" class="me-1 text-secondary" fixed-width />
              {{ $t('document.downloadExtractedText') }}
            </b-dropdown-item>
            <template v-if="hasRoot">
              <b-dropdown-divider></b-dropdown-divider>
              <b-dropdown-item :href="document.fullRootUrl" class="document-actions__download--parent">
                <fa icon="download" class="me-1 text-secondary" fixed-width />
                {{ $t('document.downloadRootButton') }}
              </b-dropdown-item>
              <b-dropdown-item
                v-if="hasRootCleanableContentType"
                :href="rootDocumentFullUrlWithoutMetadata"
                class="document-actions__download--parent-without-metadata"
              >
                <fa icon="download" class="me-1 text-secondary" fixed-width />
                {{ $t('document.downloadRootWithoutMetadataButton') }}
              </b-dropdown-item>
            </template>
          </b-dropdown>
        </b-button-group>
      </span>
      <b-popover
        :placement="tooltipsPlacement"
        :target="downloadBtnId"
        :title="document.contentTypeLabel"
        triggers="hover focus"
      >
        <document-type-card :document="document" />
      </b-popover>
    </template>
    <router-link-popup
      :id="popupBtnId"
      class="document-actions__popup btn"
      :class="popupBtnClass"
      :to="{ name: 'document-modal', params: document.routerParams }"
    >
      <fa icon="external-link-alt" fixed-width />
      <span class="ms-2" :class="{ 'sr-only': !popupBtnLabel }">
        {{ $t('document.externalWindow') }}
      </span>
    </router-link-popup>
    <b-tooltip :target="popupBtnId" :placement="tooltipsPlacement">
      {{ $t('document.externalWindow') }}
    </b-tooltip>
  </component>
</template>

<script>
import { findIndex, uniqueId } from 'lodash'
import { mapState } from 'vuex'
import { FontAwesomeLayers } from '@fortawesome/vue-fontawesome'

import { EventBus } from '@/utils/event-bus'
import byteSize from '@/filters/byteSize'
import humanSize from '@/filters/humanSize'
import DocumentTypeCard from '@/components/DocumentTypeCard'
import RouterLinkPopup from '@/components/RouterLinkPopup'

/**
 * A list actions to apply to a document
 */
export default {
  name: 'DocumentActions',
  components: {
    DocumentTypeCard,
    FontAwesomeLayers,
    RouterLinkPopup
  },
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
     * Use a dropdown to for advanced download options
     */
    displayDownloadOptions: {
      type: Boolean,
      default: false
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
     * Class to apply to the download group button
     */
    downloadBtnGroupClass: {
      type: String,
      default: ''
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
     * Disable the use of button group around each button
     */
    noBtnGroup: {
      type: Boolean
    }
  },
  data() {
    return {
      cleanableContentTypes: ['application/pdf', 'application/msword']
    }
  },
  computed: {
    ...mapState('starred', { starredDocuments: 'documents' }),
    isStarred() {
      const { index, id } = this.document
      return findIndex(this.starredDocuments, { index, id }) > -1
    },
    starBtnClassDefinition() {
      return {
        [this.starredBtnClass]: this.isStarred,
        ...this.classAttributeToObject(this.starBtnClass)
      }
    },
    starBtnId() {
      return uniqueId('document-actions-star-button-')
    },
    downloadBtnId() {
      return uniqueId('document-actions-download-button-')
    },
    downloadBtnWrapperId() {
      return uniqueId('document-actions-download-button-wrapper-')
    },
    popupBtnId() {
      return uniqueId('document-actions-popup-button-')
    },
    documentFullUrlWithoutMetadata() {
      return this.document.fullUrl + '&filter_metadata=true'
    },
    rootDocumentFullUrlWithoutMetadata() {
      return this.document.fullRootUrl + '&filter_metadata=true'
    },
    canIDownload() {
      return this.isDownloadAllowed
    },
    hasRoot() {
      return !!this.document.root
    },
    hasCleanableContentType() {
      return this.cleanableContentTypes.includes(this.document.contentType)
    },
    hasRootCleanableContentType() {
      return this.hasRoot && this.cleanableContentTypes.includes(this.document.root.contentType)
    },
    isRootTooBig() {
      return this.hasRoot && this.rootSize > this.maxRootSize
    },
    rootSize() {
      return this.document?.root?.contentLength
    },
    maxRootSize() {
      return byteSize(this.$config.get('embeddedDocumentDownloadMaxSize'))
    },
    humanMaxRootSize() {
      return humanSize(this.maxRootSize)
    }
  },
  async mounted() {
    // No need to request starred docs once the state has already been filled
    const starredDocs = this.$store?.state?.starred?.documents
    if (starredDocs?.length === 0) {
      return this.$store.dispatch('starred/fetchIndicesStarredDocuments')
    }
  },
  methods: {
    async documentOriginalExtractedText() {
      if (!this.document.content) {
        await this.$store.dispatch('document/getContent')
      }
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([this.document.content], { type: 'text/plain;charset=UTF-8' }))
      a.download = `${this.document.title}.txt`
      a.click()
    },
    classAttributeToObject(str) {
      const list = str.split(' ')
      return Object.assign({}, ...list.map((key) => ({ [key]: true })))
    },
    async toggleStarDocument() {
      try {
        await this.$store.dispatch('starred/toggleStarDocument', this.document)
      } catch (_) {
        this.$bvToast.toast(this.$t('document.starringError'), { noCloseButton: true, variant: 'danger' })
      }
      EventBus.emit('bv::hide::tooltip')
      EventBus.emit('filter::starred::refresh')
    }
  }
}
</script>
