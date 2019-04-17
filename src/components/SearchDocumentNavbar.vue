<template>
  <div class="search-document-navbar px-3 py-2">
    <router-link :to="{ name: 'search', query }" class="search-document-navbar__back">
      <fa icon="chevron-circle-left" />
      {{ $t('search.back') }}
    </router-link>
    <span class="search-document-navbar__nav ml-auto btn-group" v-if="currentDocumentIndex > -1">
      <a @click="goToPreviousDocument" v-if="hasPreviousDocument" class="btn btn-sm py-0" :title="$t('search.nav.previous.tooltip')" v-b-tooltip>
        <fa icon="angle-left" />
        <span class="d-sm-none d-md-inline">
        {{ $t('search.nav.previous.label') }}
        </span>
      </a>
      <a @click="goToNextDocument" v-if="hasNextDocument" class="btn btn-sm py-0" :title="$t('search.nav.next.tooltip')" v-b-tooltip>
        <span class="d-sm-none d-md-inline">
          {{ $t('search.nav.next.label') }}
        </span>
        <fa icon="angle-right" />
      </a>
    </span>
  </div>
</template>

<style lang="scss" scoped>
  .search-document-navbar {
    display: flex;
    width: 100%;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 100;

    @media (max-width: $document-float-breakpoint-width) {
      color: white;
      background: darken($primary, 10);
    }

    &__back {
      color: inherit;
      display: none;

      @media (max-width: $document-float-breakpoint-width) {
        display: inline;
      }
    }

    &__nav .btn {
      cursor: pointer;
      background: transparent;
      color: inherit;
      border-color: currentColor;
    }
  }
</style>

<script>
import first from 'lodash/first'
import last from 'lodash/last'
import findIndex from 'lodash/findIndex'
import { mapState } from 'vuex'

export default {
  name: 'SearchDocumentNavbar',
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
    }
  },
  methods: {
    async goToDocument (document) {
      const name = document.isEmail ? 'email' : 'document'
      return this.$router.push({ name, params: document.routerParams })
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
