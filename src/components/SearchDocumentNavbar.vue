<template>
  <div class="search-document-navbar px-3 py-2 bg-dark text-white text-nowrap">
    <router-link :to="{ name: 'search', query }" class="search-document-navbar__back flex-grow-1 text-truncate pr-1" v-shortkey="getKeys('backToSearchResults')" @shortkey.native="getAction('backToSearchResults')">
      <fa icon="chevron-circle-left" class="mr-1" />
      {{ $t('search.back') }}
    </router-link>
    <div v-if="currentDocument" class="ml-auto">
      <span class="search-document-navbar__nav" v-if="currentDocumentIndex > -1">
        <button @click="goToPreviousDocument" v-shortkey="getKeys('goToPreviousDocument')" @shortkey="getAction('goToPreviousDocument')" :disabled="!hasPreviousDocument" class="btn btn-sm btn-link text-white py-0" id="previous-document-button">
          <fa icon="angle-left" class="mr-1" />
          <span class="d-sm-none d-md-inline">
            {{ $t('search.nav.previous.label') }}
          </span>
        </button>
        <b-tooltip target="previous-document-button" triggers="hover">
          <span v-html="previousTooltip"></span>
        </b-tooltip>
        <button @click="goToNextDocument" v-shortkey="getKeys('goToNextDocument')" @shortkey="getAction('goToNextDocument')" :disabled="!hasNextDocument" class="btn btn-sm btn-link text-white py-0" id="next-document-button">
          <span class="d-sm-none d-md-inline">
            {{ $t('search.nav.next.label') }}
          </span>
          <fa icon="angle-right" class="ml-1" />
        </button>
        <b-tooltip target="next-document-button" triggers="hover">
          <span v-html="nextTooltip"></span>
        </b-tooltip>
      </span>
      <document-actions
        :document="currentDocument"
        class="search-document-navbar__actions d-flex"
        star-btn-class="btn btn-link text-white py-0 px-2 order-1"
        popup-btn-class="btn btn-link text-white py-0 px-2 order-1"
        download-btn-class="btn btn-secondary order-2 btn-sm py-0 ml-1"
        download-btn-label
        no-btn-group
        is-download-allowed />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import findIndex from 'lodash/findIndex'
import first from 'lodash/first'
import last from 'lodash/last'
import { getOS } from '@/utils/utils'
import shortkeys from '@/mixins/shortkeys'

import RouterLinkPopup from '@/components/RouterLinkPopup'
import DocumentActions from '@/components/DocumentActions'
import features from '@/mixins/features'

export default {
  name: 'SearchDocumentNavbar',
  mixins: [features, shortkeys],
  components: {
    RouterLinkPopup,
    DocumentActions
  },
  computed: {
    ...mapState('search', ['response', 'isDownloadAllowed']),
    ...mapState('document', { currentDocument: 'doc' }),
    query () {
      return this.$store.getters['search/toRouteQuery']
    },
    currentDocumentIndex () {
      if (this.currentDocument) {
        return findIndex(this.response.hits, { id: this.currentDocument.id })
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
      return this.currentDocumentIndex === this.response.hits.length - 1
    },
    firstDocument () {
      return first(this.response.hits)
    },
    lastDocument () {
      return last(this.response.hits)
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
      return this.response.hits[this.currentDocumentIndex - 1]
    },
    nextDocument () {
      return this.response.hits[this.currentDocumentIndex + 1]
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
    goToDocument (document) {
      if (document) {
        return this.$router.push({ name: 'document', params: document.routerParams })
      }
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

<style lang="scss">
  .search-document-navbar {
    display: flex;
    align-items: center;
    margin: 0;
    border-radius: inherit inherit 0 0;

    @media (max-width: $document-float-breakpoint-width) {
      margin: 0;
      border-radius: 0;
    }

    &__back, &__back:hover {
      font-size: 0.875rem;
      color: inherit;
      display: inline;
    }

    &__nav .btn {
      cursor: pointer;
    }

    &__actions {
      float: right;
    }
  }
</style>
