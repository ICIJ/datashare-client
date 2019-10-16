<template>
  <div class="document-actions" :class="{ 'btn-group-vertical': vertical, 'btn-group': !vertical }">
    <a class="document-actions__star btn btn-link btn-sm" :class="{ starred: isStarred(document.id) }" href :title="$t('document.star_file')" @click.prevent="toggleStarDocument(document.id)" v-b-tooltip>
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fa-fw />
      <span class="sr-only">{{ $t('document.star_button') }}</span>
    </a>
    <a class="document-actions__download btn btn-link btn-sm" :href="document.fullUrl" target="_blank" :title="$t('document.download_file')" v-b-tooltip v-if="isDownloadAllowed">
      <fa icon="download" fa-fw />
      <span class="sr-only">{{ $t('document.download_button') }}</span>
      <span v-if="displayDownload" class="ml-1">{{ $t('document.download_button') }}</span>
    </a>
    <router-link-popup :to="{ name: 'document-simplified', params: document.routerParams }" class="btn btn-sm btn-link" :title="$t('document.external_window')" v-b-tooltip>
      <fa icon="external-link-alt" fa-fw />
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
    vertical: Boolean,
    document: Object,
    displayDownload: Boolean,
    isDownloadAllowed: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    ...mapState('search', ['starredDocuments'])
  },
  methods: {
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
