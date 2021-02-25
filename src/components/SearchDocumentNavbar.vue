<template>
  <document-navbar class="search-document-navbar" :is-shrinked="isShrinked">
    <template #back>
      <router-link
        class="document-navbar__back pr-1"
        :class="{ 'flex-grow-1': !isShrinked }"
        :to="{ name: 'search', query }"
        :title="$t('search.back')"
        v-b-tooltip.right="{ customClass: isShrinked ? '' : 'd-none' }"
        v-shortkey="getKeys('backToSearchResults')"
        @shortkey.native="getAction('backToSearchResults')">
        <fa icon="chevron-circle-left"></fa>
        <transition name="slide-x">
          <span v-if="!isShrinked" class="document-navbar__back__label ml-2">
            {{ $t('search.back') }}
          </span>
        </transition>
      </router-link>
    </template>
    <template #nav>
      <span class="document-navbar__nav" v-if="documentIndex > -1">
        <button @click="goToPreviousDocument" v-shortkey="getKeys('goToPreviousDocument')" @shortkey="getAction('goToPreviousDocument')" :disabled="!hasPreviousDocument" class="btn btn-sm btn-link text-white py-0" id="previous-document-button">
          <fa icon="angle-left" class="mr-1"></fa>
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
          <fa icon="angle-right" class="ml-1"></fa>
        </button>
        <b-tooltip target="next-document-button" triggers="hover">
          <span v-html="nextTooltip"></span>
        </b-tooltip>
      </span>
    </template>
  </document-navbar>
</template>

<script>
import { getShortkeyOS } from '@/utils/utils'
import findIndex from 'lodash/findIndex'
import first from 'lodash/first'
import last from 'lodash/last'

import DocumentNavbar from '@/components/document/DocumentNavbar'
import shortkeys from '@/mixins/shortkeys'

/**
 * Document navbar in the context of a search.
 */
export default {
  name: 'SearchDocumentNavbar',
  mixins: [shortkeys],
  components: {
    DocumentNavbar
  },
  props: {
    /**
     * Shrink the layout of the navbar.
     */
    isShrinked: {
      type: Boolean
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
    goToDocument (document) {
      if (document) {
        const params = document.routerParams
        const query = { q: this.$store.state.search.query }
        return this.$router.push({ name: 'document', params, query })
      }
    },
    async goToPreviousDocument () {
      if (this.navRequiresPreviousPage) {
        await this.$store.dispatch('search/previousPage')
        return this.goToDocument(this.lastDocument)
      } else {
        return this.goToDocument(this.previousDocument)
      }
    },
    async goToNextDocument () {
      if (this.navRequiresNextPage) {
        await this.$store.dispatch('search/nextPage')
        return this.goToDocument(this.firstDocument)
      } else {
        return this.goToDocument(this.nextDocument)
      }
    }
  },
  computed: {
    doc () {
      return this.$store.state.document.doc
    },
    response () {
      return this.$store.state.search.response
    },
    query () {
      return this.$store.getters['search/toRouteQuery']()
    },
    documentIndex () {
      return this.doc ? findIndex(this.response.hits, { id: this.doc.id }) : -1
    },
    navRequiresPreviousPage () {
      return this.isFirstDocument && !this.isFirstPage
    },
    navRequiresNextPage () {
      return this.isLastDocument && !this.isLastPage
    },
    isFirstDocument () {
      return this.documentIndex === 0
    },
    isLastDocument () {
      return this.documentIndex === this.response.hits.length - 1
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
      return this.response.hits[this.documentIndex - 1]
    },
    nextDocument () {
      return this.response.hits[this.documentIndex + 1]
    },
    previousTooltip () {
      return getShortkeyOS() === 'mac' ? this.$t('search.nav.previous.tooltipMac') : this.$t('search.nav.previous.tooltipOthers')
    },
    nextTooltip () {
      return getShortkeyOS() === 'mac' ? this.$t('search.nav.next.tooltipMac') : this.$t('search.nav.next.tooltipOthers')
    }
  }
}
</script>
