<template>
  <div class="search-document-navbar px-3 py-2 bg-dark text-white text-nowrap" :class="{ 'search-document-navbar--shrinked': isShrinked }">
    <router-link
      class="search-document-navbar__back pr-1"
      :class="{ 'flex-grow-1': !isShrinked }"
      :to="{ name: 'search', query }"
      :title="$t('search.back')"
      v-b-tooltip.right="{ customClass: isShrinked ? '' : 'd-none' }"
      v-shortkey="getKeys('backToSearchResults')"
      @shortkey.native="getAction('backToSearchResults')">
      <fa icon="chevron-circle-left"></fa>
      <transition name="slide-x">
        <span v-if="!isShrinked" class="search-document-navbar__back__label ml-2">
          {{ $t('search.back') }}
        </span>
      </transition>
    </router-link>
    <transition name="slide-x">
      <b-btn v-if="isShrinked" class="search-document-navbar__title text-left font-weight-bold flex-grow-1 px-2 text-white py-0 text-truncate" @click="scrollToTop" variant="link">
        {{ doc.title }}
      </b-btn>
    </transition>
    <div v-if="doc" class="ml-auto d-flex align-items-center">
      <span class="search-document-navbar__nav" v-if="documentIndex > -1">
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
      <b-btn class="mx-2 px-2 py-0 search-document-navbar__recommended-by" size="sm" @click="toggleAsRecommended" :data-recommended-label="$t('search.nav.markAsRecommended')" :data-unrecommended-label="$t('search.nav.unmarkAsRecommended')" :variant="markAsRecommendedVariant">
        {{ markAsRecommendedLabel }}
      </b-btn>
      <template v-if="isServer">
        <b-badge pill :variant="markAsRecommendedVariant" class="mr-2 search-document-navbar__recommended-by-number" id="popover-recommended-by">
          {{ recommendedBy.length }}
        </b-badge>
        <b-popover target="popover-recommended-by" triggers="hover" placement="bottom">
          <div>
            {{ $tc('search.nav.markAsRecommendedBy',  recommendedBy.length, { count: recommendedBy.length }) }}
          </div>
          <ul class="mb-0 pl-3">
            <li v-for="user in recommendedBy" :key="user">
              {{ user }}
            </li>
          </ul>
        </b-popover>
      </template>
      <b-btn variant="link" class="text-white py-0 px-2 px-2 py-0 search-document-navbar__share" id="popover-document-share" size="sm">
        <fa icon="share-alt"></fa>
      </b-btn>
      <b-popover target="popover-document-share"
                 triggers="click blur"
                 placement="bottom"
                 custom-class="popover-body-p-0 popover-body-overflow-hidden w-100"
                 @show="$root.$emit('bv::hide::tooltip')">
        <advanced-link-form
          card
          no-fade
          :title="doc.slicedNameToString"
          :link="documentLink"></advanced-link-form>
      </b-popover>
      <b-tooltip target="popover-document-share" triggers="hover">
        {{ $t('search.nav.share') }}
      </b-tooltip>
      <document-actions
        class="search-document-navbar__actions d-flex"
        :document="doc"
        download-btn-class="btn btn-secondary order-2 btn-sm py-0 ml-1"
        download-btn-label
        :is-download-allowed="isDownloadAllowed"
        no-btn-group
        popup-btn-class="btn btn-link text-white py-0 px-2 order-1"
        star-btn-class="btn btn-link text-white py-0 px-2 order-1"></document-actions>
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

/**
 * Document navbar in the context of a search.
 */
export default {
  name: 'SearchDocumentNavbar',
  mixins: [shortkeys, utils],
  components: {
    DocumentActions
  },
  computed: {
    ...mapState('document', ['doc', 'isRecommended', 'recommendedBy']),
    ...mapState('search', ['isDownloadAllowed', 'response']),
    query () {
      return this.$store.getters['search/toRouteQuery']()
    },
    documentLink () {
      const route = this.$router.resolve({ name: 'document', params: this.doc.routerParams })
      const { protocol, host, pathname } = window.location
      return [protocol, '//', host, pathname, route.href].join('')
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
    },
    markAsRecommendedLabel () {
      return this.isRecommended ? this.$t('search.nav.unmarkAsRecommended') : this.$t('search.nav.markAsRecommended')
    },
    markAsRecommendedVariant () {
      return this.isRecommended ? 'success' : 'light'
    }
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
    async toggleAsRecommended () {
      await this.$store.dispatch('document/toggleAsRecommended')
      await this.$store.dispatch('search/getRecommendationsByProject')
    },
    scrollToTop () {
      document.getElementById('search__body__document__wrapper').scrollTop = 0
    }
  }
}
</script>

<style lang="scss">
  .search-document-navbar {
    align-items: center;
    display: flex;
    margin: 0;

    @media (max-width: $document-float-breakpoint-width) {
      border-radius: 0;
      margin: 0;
    }

    &__back, &__back:hover {
      color: inherit;
      display: inline;
      font-size: $font-size-sm;
    }

    &__back .svg-inline--fa {
      transition: 500ms transform;
    }

    &--shrinked &__back .svg-inline--fa {
      transform: scale(1.3)
    }

    &__back__label {
      position: absolute;
    }

    &__title, &__back__label {
      display: inline-block;

      &.slide-x-enter-active,
      &.slide-x-leave-active {
        transition: 500ms;
      }

      &.slide-x-enter {
        opacity: 0;
        transform: translateY(100%);
      }

      &.slide-x-leave-to {
        opacity: 0;
        transform: translateY(-100%);
      }
    }

    &__recommended-by {
      position: relative;

      &:before, &:after{
        color: transparent;
        display: block;
        height: 0;
        overflow: hidden;
        text-overflow: -999999px;
        visibility: hidden;
      }

      &:before {
        content: attr(data-unrecommended-label);
      }

      &:after {
        content: attr(data-recommended-label);
      }
    }

    &__nav .btn {
      cursor: pointer;
    }
  }
</style>
