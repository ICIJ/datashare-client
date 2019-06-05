<template>
  <div class="search-document-navbar px-3 py-2">
    <router-link :to="{ name: 'search', query }" class="search-document-navbar__back">
      <fa icon="chevron-circle-left" />
      {{ $t('search.back') }}
    </router-link>
    <a class="btn btn-sm py-0 ml-auto mr-2 search-document-navbar__download btn-secondary" :href="currentDocument.fullUrl" target="_blank" :title="$t('document.download_file')" v-if="currentDocument">
      <fa icon="download" />
      {{ $t('document.download_button') }}
    </a>
    <span class="search-document-navbar__nav btn-group" v-if="currentDocumentIndex > -1">
      <button @click="goToPreviousDocument" v-shortkey="['ctrl', 'arrowleft']" @shortkey="goToPreviousDocument" :disabled="!hasPreviousDocument" class="btn btn-sm py-0" :title="$t('search.nav.previous.tooltip')" v-b-tooltip.html.topleft>
        <fa icon="angle-left" />
        <span class="d-sm-none d-md-inline">
        {{ $t('search.nav.previous.label') }}
        </span>
      </button>
      <button @click="goToNextDocument" v-shortkey="['ctrl', 'arrowright']" @shortkey="goToNextDocument" :disabled="!hasNextDocument" class="btn btn-sm py-0" :title="$t('search.nav.next.tooltip')" v-b-tooltip.html.topleft>
        <span class="d-sm-none d-md-inline">
          {{ $t('search.nav.next.label') }}
        </span>
        <fa icon="angle-right" />
      </button>
    </span>
  </div>
</template>

<style lang="scss" scoped>
  .search-document-navbar {
    display: flex;
    align-items: center;
    position: sticky;
    top: $spacer;
    z-index: 100;
    margin: $spacer $spacer 0;
    color: white;
    background: darken($primary, 10);
    border-radius: $card-border-radius $card-border-radius 0 0;
    // Fake a gap between the top of the window when the navbar is in sticky mode
    box-shadow: 0 -2 * $spacer 0 0 $body-bg;

    @media (max-width: $document-float-breakpoint-width) {
      margin: 0;
      border-radius: 0;
      top: 0;
      box-shadow: none;
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
  mounted () {
    this.saveComponentHeight()
  },
  updated () {
    this.saveComponentHeight()
  },
  methods: {
    saveComponentHeight () {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--search-document-navbar-height', height)
    },
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
