<template>
  <div class="search-document-navbar px-3 py-2 bg-dark text-white text-nowrap">
    <router-link
      :to="{ name: 'search', query }"
      class="search-document-navbar__back text-truncate pr-1"
      :class="{ 'flex-grow-1': !isShrinked }"
      v-shortkey="getKeys('backToSearchResults')"
      @shortkey.native="getAction('backToSearchResults')">
      <fa icon="chevron-circle-left" class="mr-1" />
      <span v-if="!isShrinked">
        {{ $t('search.back') }}
      </span>
    </router-link>
    <b-btn v-if="isShrinked" class="search-document-navbar__title text-left flex-grow-1 px-1 text-white py-0 text-truncate" @click="scrollToTop" variant="link">
      {{ currentDocument.title }}
    </b-btn>
    <div v-if="currentDocument" class="ml-auto d-flex align-items-center">
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
      <b-btn class="mx-2 px-2 py-0 search-document-navbar__read-by" size="sm" @click="toggleAsRead"  :data-read-label="$t('search.nav.markAsRead')" :data-unread-label="$t('search.nav.markAsUnread')" :variant="markAsReadVariant">
        {{ markAsReadLabel }}
      </b-btn>
      <template v-if="isServer">
        <b-badge pill :variant="markAsReadVariant" class="mr-2 search-document-navbar__read-by-number" id="popover-read-by">
          {{ readBy.length }}
        </b-badge>
        <b-popover target="popover-read-by" triggers="hover" placement="bottom" v-if="readBy.length > 0">
          <div>
            {{ $tc('search.nav.markAsReadBy',  readBy.length, { count: readBy.length }) }}
          </div>
          <ul class="mb-0 pl-3">
            <li v-for="user in readBy" :key="user">
              {{ user }}
            </li>
          </ul>
        </b-popover>
      </template>
      <document-actions
        :document="currentDocument"
        class="search-document-navbar__actions d-flex"
        star-btn-class="btn btn-link text-white py-0 px-2 order-1"
        popup-btn-class="btn btn-link text-white py-0 px-2 order-1"
        download-btn-class="btn btn-secondary order-2 btn-sm py-0 ml-1"
        download-btn-label
        no-btn-group
        :is-download-allowed="isDownloadAllowed" />
    </div>
  </div>
</template>

<script>
import findIndex from 'lodash/findIndex'
import first from 'lodash/first'
import last from 'lodash/last'
import { getShortkeyOS } from '@/utils/utils'
import { mapState } from 'vuex'

import DocumentActions from '@/components/DocumentActions'
import shortkeys from '@/mixins/shortkeys'
import utils from '@/mixins/utils'

export default {
  name: 'SearchDocumentNavbar',
  mixins: [shortkeys, utils],
  components: {
    DocumentActions
  },
  props: {
    isShrinked: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('search', ['response', 'isDownloadAllowed']),
    ...mapState('document', { currentDocument: 'doc', readBy: 'readBy', isRead: 'isRead' }),
    query () {
      return this.$store.getters['search/toRouteQuery']()
    },
    currentDocumentIndex () {
      return this.currentDocument ? findIndex(this.response.hits, { id: this.currentDocument.id }) : -1
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
      return getShortkeyOS() === 'mac' ? this.$t('search.nav.previous.tooltipMac') : this.$t('search.nav.previous.tooltipOthers')
    },
    nextTooltip () {
      return getShortkeyOS() === 'mac' ? this.$t('search.nav.next.tooltipMac') : this.$t('search.nav.next.tooltipOthers')
    },
    markAsReadLabel () {
      return this.isRead ? this.$t('search.nav.markAsUnread') : this.$t('search.nav.markAsRead')
    },
    markAsReadVariant () {
      return this.isRead ? 'success' : 'light'
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
        return this.$router.push({ name: 'document', params: document.routerParams, query: { q: this.$store.state.search.query } })
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
    },
    async toggleAsRead () {
      await this.$store.dispatch('document/toggleAsRead')
    },
    scrollToTop () {
      document.getElementById('search__body__document__wrapper').scrollTop = 0
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
      font-size: $font-size-sm;
      color: inherit;
      display: inline;
    }

    &__read-by {
      position: relative;

      &:before, &:after{
        display: block;
        height: 0;
        overflow: hidden;
        text-overflow: -999999px;
        color: transparent;
        visibility: hidden;
      }

      &:before {
        content: attr(data-unread-label);
      }

      &:after {
        content: attr(data-read-label);
      }
    }

    &__nav .btn {
      cursor: pointer;
    }
  }
</style>
