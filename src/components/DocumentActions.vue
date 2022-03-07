<template>
  <component
    :is="noBtnGroup ? 'div' : 'b-btn-group'"
    :vertical="vertical"
    class="document-actions align-items-center">
    <a
      class="document-actions__star btn"
      :class="starBtnClassDefinition"
      @click.prevent="toggleStarDocument(document.id)"
      href
      :id="starBtnId">
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !starBtnLabel }">
      {{ $t('document.starButton') }}
    </span>
    </a>
    <b-tooltip :target="starBtnId" :placement="tooltipsPlacement">
      {{ $t('document.starFile') }}
    </b-tooltip>

    <template v-if="canIDownload">
      <b-btn-group :class="downloadBtnGroupClass">
        <a
          class="document-actions__download btn"
          :class="downloadBtnClass"
          :href="document.fullUrl"
          :id="downloadBtnId"
          target="_blank">
          <fa icon="download" fixed-width />
          <span class="ml-2" :class="{ 'sr-only': !downloadBtnLabel }">
            {{ $t('document.downloadButton') }}
          </span>
        </a>
        <b-dropdown
          v-if="displayDownloadWithoutMetadata && hasCleanableContentType"
          right
          toggle-class="py-0"
          size="sm">
          <b-dropdown-item :href="documentFullUrlWithoutMetadata">
            {{ $t('document.downloadWithoutMetadata') }}
          </b-dropdown-item>
        </b-dropdown>
      </b-btn-group>
      <b-popover
        :placement="tooltipsPlacement"
        :target="downloadBtnId"
        :title="document.contentTypeLabel"
        triggers="hover focus">
        <document-type-card :document="document" />
      </b-popover>
    </template>

    <template v-if="canIDownload && hasRoot">
      <b-btn-group :class="downloadBtnGroupClass">
        <a
          class="document-actions__download-root btn"
          :class="downloadBtnClass"
          :href="document.fullRootUrl"
          :id="downloadRootBtnId"
          target="_blank">
          <fa icon="download" fixed-width />
          <span class="ml-2" :class="{ 'sr-only': !downloadBtnLabel }">
            {{ $t('document.downloadRootButton') }}
          </span>
        </a>
        <b-dropdown
          v-if="displayDownloadWithoutMetadata && hasRootCleanableContentType"
          right
          toggle-class="py-0"
          size="sm">
          <b-dropdown-item :href="rootDocumentFullUrlWithoutMetadata">
            {{ $t('document.downloadWithoutMetadata') }}
          </b-dropdown-item>
        </b-dropdown>
      </b-btn-group>
      <b-popover
        :placement="tooltipsPlacement"
        :target="downloadRootBtnId"
        :title="document.rootContentTypeLabel"
        triggers="hover focus">
        <document-type-card :document="document.root" />
      </b-popover>
    </template>

    <router-link-popup
      class="document-actions__popup btn"
      :class="popupBtnClass"
      :id="popupBtnId"
      :to="{ name: 'document-modal', params: document.routerParams }">
      <fa icon="external-link-alt" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !popupBtnLabel }">
        {{ $t('document.externalWindow') }}
      </span>
    </router-link-popup>
    <b-tooltip :target="popupBtnId" :placement="tooltipsPlacement">
      {{ $t('document.externalWindow') }}
    </b-tooltip>
  </component>
</template>

<script>
import { uniqueId } from 'lodash'
import { mapState } from 'vuex'

import DocumentTypeCard from '@/components/DocumentTypeCard'
import RouterLinkPopup from '@/components/RouterLinkPopup'

/**
 * A list actions to apply to a document
 */
export default {
  name: 'DocumentActions',
  components: {
    DocumentTypeCard,
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
     * Use a dropdown to download document without metadata
     */
    displayDownloadWithoutMetadata: {
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
  data () {
    return {
      cleanableContentTypes: [
        'application/pdf',
        'application/msword'
      ]
    }
  },
  computed: {
    ...mapState('starred', ['starredDocuments']),
    starBtnClassDefinition () {
      const starred = this.isStarred(this.document.id)
      return { [this.starredBtnClass]: starred, ...this.classAttributeToObject(this.starBtnClass) }
    },
    starBtnId () {
      return uniqueId('document-actions-star-button-')
    },
    downloadBtnId () {
      return uniqueId('document-actions-download-button-')
    },
    downloadRootBtnId () {
      return uniqueId('document-actions-download-root-button-')
    },
    popupBtnId () {
      return uniqueId('document-actions-popup-button-')
    },
    documentFullUrlWithoutMetadata () {
      return this.document.fullUrl + '&filter_metadata=true'
    },
    rootDocumentFullUrlWithoutMetadata () {
      return this.document.fullRootUrl + '&filter_metadata=true'
    },
    canIDownload () {
      return this.isDownloadAllowed
    },
    hasRoot () {
      return this.document.root
    },
    hasCleanableContentType () {
      return this.cleanableContentTypes.includes(this.document.contentType)
    },
    hasRootCleanableContentType () {
      return this.hasRoot && this.cleanableContentTypes.includes(this.document.root.contentType)
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
        await this.$store.dispatch('starred/toggleStarDocument', documentId)
      } catch (_) {
        console.log(_)
        this.$bvToast.toast(this.$t('document.starringError'), { noCloseButton: true, variant: 'danger' })
      }
      this.$root.$emit('bv::hide::tooltip')
      this.$root.$emit('filter::starred::refresh')
    }
  }
}
</script>
