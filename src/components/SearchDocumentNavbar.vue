<template>
  <div class="search-document-navbar px-3 py-2 bg-dark text-white text-nowrap">
    <router-link :to="{ name: 'search', query }" class="search-document-navbar__back flex-grow-1 text-truncate pr-1" v-shortkey="[ 'esc' ]"  @shortkey.native="back()">
      <fa icon="chevron-circle-left" />
      {{ $t('search.back') }}
    </router-link>
    <div v-if="currentDocument" class="ml-auto">
      <a class="btn btn-sm py-0 mr-2 search-document-navbar__download btn-secondary" :href="currentDocument.fullUrl" target="_blank" :title="$t('document.download_file')" v-if="currentDocument" id="search-document-navbar-download">
        <fa icon="download" />
        {{ $t('document.download_button') }}
      </a>
      <b-popover target="search-document-navbar-download" triggers="hover focus" placement="bottomleft" :title="currentDocument.contentTypeLabel">
        <document-type-card :document="currentDocument" />
      </b-popover>
      <span class="search-document-navbar__nav btn-group" v-if="currentDocumentIndex > -1">
        <button @click="goToPreviousDocument" v-shortkey="[getShortkey, 'arrowleft']" @shortkey="goToPreviousDocument" :disabled="!hasPreviousDocument" class="btn btn-sm btn-outline-light py-0" :title="previousTooltip" v-b-tooltip.html.bottomleft>
          <fa icon="angle-left" />
          <span class="d-sm-none d-md-inline">
            {{ $t('search.nav.previous.label') }}
          </span>
        </button>
        <button @click="goToNextDocument" v-shortkey="[getShortkey, 'arrowright']" @shortkey="goToNextDocument" :disabled="!hasNextDocument" class="btn btn-sm btn-outline-light py-0" :title="nextTooltip" v-b-tooltip.html.bottomleft>
          <span class="d-sm-none d-md-inline">
            {{ $t('search.nav.next.label') }}
          </span>
          <fa icon="angle-right" />
        </button>
      </span>
      <router-link-popup :to="{ name: 'document-simplified', params: currentDocument.routerParams }" class="btn btn-sm btn-outline-light ml-2 py-0" :title="$t('document.external_window')" v-b-tooltip.bottomleft>
        <fa icon="external-link-alt" />
      </router-link-popup>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import findIndex from 'lodash/findIndex'
import first from 'lodash/first'
import last from 'lodash/last'
import { getOS } from '@/utils/utils'

import DocumentTypeCard from '@/components/DocumentTypeCard'
import RouterLinkPopup from '@/components/RouterLinkPopup'

export default {
  name: 'SearchDocumentNavbar',
  components: {
    DocumentTypeCard,
    RouterLinkPopup
  },
  computed: {
    ...mapState('search', { searchResponse: 'response' }),
    ...mapState('document', { currentDocument: 'doc' }),
    query () {
      return this.$store.getters['search/toRouteQuery']
    },
    currentDocumentIndex () {
      if (this.currentDocument) {
        return findIndex(this.searchResponse.hits, { id: this.currentDocument.id })
      }
      return -1
    },
    navRequiresPreviousPage () {
      return this.isFirstDocument && !this.isFirstPage
    },
    navRequiresNextPage () {
      return this.isLastDocument && !this.isLastPage
    },
    isFirstDocument () {
      return this.currentDocumentIndex === 0
    },
    isLastDocument () {
      return this.currentDocumentIndex === this.searchResponse.hits.length - 1
    },
    firstDocument () {
      return first(this.searchResponse.hits)
    },
    lastDocument () {
      return last(this.searchResponse.hits)
    },
    isFirstPage () {
      return this.$store.state.search.from === 0
    },
    isLastPage () {
      return this.$store.state.search.from + this.$store.state.search.size >= this.$store.state.search.response.total
    },
    hasPreviousDocument () {
      return !this.isFirstDocument || !this.isFirstPage
    },
    hasNextDocument () {
      return !this.isLastDocument || !this.isLastPage
    },
    previousDocument () {
      return this.searchResponse.hits[this.currentDocumentIndex - 1]
    },
    nextDocument () {
      return this.searchResponse.hits[this.currentDocumentIndex + 1]
    },
    getShortkey () {
      return getOS() === 'mac' ? 'meta' : 'ctrl'
    },
    previousTooltip () {
      return getOS() === 'mac' ? this.$t('search.nav.previous.tooltipMac') : this.$t('search.nav.previous.tooltipOthers')
    },
    nextTooltip () {
      return getOS() === 'mac' ? this.$t('search.nav.next.tooltipMac') : this.$t('search.nav.next.tooltipOthers')
    }
  },
  mounted () {
    this.saveComponentHeight()
  },
  updated () {
    this.saveComponentHeight()
  },
  methods: {
    back () {
      this.$router.push({ name: 'search', query: this.query })
    },
    saveComponentHeight () {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--search-document-navbar-height', height)
    },
    async goToDocument (document) {
      return this.$router.push({ name: 'document', params: document.routerParams })
    },
    async goToPreviousDocument () {
      if (this.navRequiresPreviousPage) {
        await this.$store.dispatch('search/previousPage')
        return this.goToDocument(this.lastDocument)
      }
      return this.goToDocument(this.previousDocument)
    },
    async goToNextDocument () {
      if (this.navRequiresNextPage) {
        await this.$store.dispatch('search/nextPage')
        return this.goToDocument(this.firstDocument)
      }
      return this.goToDocument(this.nextDocument)
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-document-navbar {
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;
    margin: 0 $spacer 0;
    border-radius: $card-border-radius $card-border-radius 0 0;

    @media (max-width: $document-float-breakpoint-width) {
      margin: 0;
      border-radius: 0;
    }

    &__back {
      color: inherit;
      display: inline;
    }

    &__nav .btn {
      cursor: pointer;
    }
  }
</style>
