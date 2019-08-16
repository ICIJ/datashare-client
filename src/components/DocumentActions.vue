<template>
  <div class="document-actions" :class="{ 'btn-group-vertical': vertical, 'btn-group': !vertical }">
    <a class="document-actions__star btn btn-link btn-sm" :class="{ starred: isStarred(document.id) }" href @click.prevent="" :title="$t('document.star_file')" @click="toggleStarDocument(document.id)" v-b-tooltip.left>
      <fa :icon="[isStarred(document.id) ? 'fa' : 'far', 'star']" fa-fw />
      <span class="sr-only">{{ $t('document.star_button') }}</span>
    </a>
    <a class="document-actions__download btn btn-link btn-sm" :href="document.fullUrl" target="_blank" :title="$t('document.download_file')" v-b-tooltip.left>
      <fa icon="download" fa-fw />
      <span class="sr-only">{{ $t('document.download_button') }}</span>
    </a>
    <router-link-popup :to="{ name: 'document-simplified', params: document.routerParams }" class="btn btn-sm btn-link" :title="$t('document.external_window')" v-b-tooltip.left>
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
    vertical: {
      type: Boolean
    },
    document: {
      type: Object
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
        // Does... nothing yet!
        console.log(_)
      }
      this.$root.$emit('facet::starred:refresh')
    }
  }
}
</script>
