<template>
  <div class="document-actions" :class="{ 'btn-group-vertical': !noBtnGroup && vertical, 'btn-group': !noBtnGroup && !vertical }">
    <a class="document-actions__star btn" :class="starBtnClassDefinition" href :title="$t('document.star_file')" @click.prevent="toggleStarDocument(document.id)" v-b-tooltip>
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !starBtnLabel }">{{ $t('document.star_button') }}</span>
    </a>
    <a class="document-actions__download btn" :class="downloadBtnClassDefinition" :href="document.fullUrl" target="_blank" :title="$t('document.download_file')" v-b-tooltip v-if="isDownloadAllowed">
      <fa icon="download" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !downloadBtnLabel }">{{ $t('document.download_button') }}</span>
    </a>
    <router-link-popup class="document-actions__popup btn" :class="popupBtnClassDefinition" :to="{ name: 'document-simplified', params: document.routerParams }" :title="$t('document.external_window')" v-b-tooltip>
      <fa icon="external-link-alt" fixed-width />
      <span class="ml-2" :class="{ 'sr-only': !popupBtnLabel }">{{ $t('document.external_window') }}</span>
    </router-link-popup>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import RouterLinkPopup from '@/components/RouterLinkPopup'

export default {
  name: 'DocumentActions',
  components: {
    RouterLinkPopup
  },
  props: {
    document: {
      type: Object
    },
    vertical: {
      type: Boolean
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
      const starred = this.isStarred(document.id)
      return { [this.starredBtnClass]: starred, ...this.classAttributeToObject(this.starBtnClass) }
    },
    downloadBtnClassDefinition () {
      return this.classAttributeToObject(this.downloadBtnClass)
    },
    popupBtnClassDefinition () {
      return this.classAttributeToObject(this.popupBtnClass)
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
