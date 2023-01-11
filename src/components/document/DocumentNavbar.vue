<template>
  <div
    class="document-navbar px-3 py-2 bg-dark text-white text-nowrap"
    :class="{ 'document-navbar--shrinked': isShrinked }"
  >
    <slot name="back" />
    <slot name="title">
      <transition name="slide-x">
        <b-btn
          v-if="isShrinked"
          class="document-navbar__title text-left font-weight-bold flex-grow-1 px-2 text-white py-0 text-truncate"
          variant="link"
          @click="scrollToTop"
        >
          {{ doc.title }}
        </b-btn>
      </transition>
    </slot>
    <div v-if="doc" class="ml-auto d-flex align-items-center">
      <slot name="nav" />
      <b-btn
        class="mx-2 px-2 py-0 document-navbar__recommended-by"
        size="sm"
        :data-recommended-label="$t('search.nav.markAsRecommended')"
        :data-unrecommended-label="$t('search.nav.unmarkAsRecommended')"
        :variant="markAsRecommendedVariant"
        @click="toggleAsRecommended"
      >
        {{ markAsRecommendedLabel }}
      </b-btn>
      <template v-if="isServer">
        <b-badge
          id="popover-recommended-by"
          pill
          :variant="markAsRecommendedVariant"
          class="mr-2 document-navbar__recommended-by-number"
        >
          {{ recommendedBy.length }}
        </b-badge>
        <b-popover target="popover-recommended-by" triggers="hover" placement="bottom">
          <div>
            {{ $tc('search.nav.markAsRecommendedBy', recommendedBy.length, { count: recommendedBy.length }) }}
          </div>
          <ul class="mb-0 mt-2 list-unstyled">
            <li v-for="user in recommendedBy" :key="user">
              <user-display :username="user" />
            </li>
          </ul>
        </b-popover>
      </template>
      <b-btn
        id="popover-document-share"
        variant="link"
        class="text-white py-0 px-2 px-2 py-0 document-navbar__share"
        size="sm"
      >
        <fa icon="share-alt"></fa>
      </b-btn>
      <b-popover
        target="popover-document-share"
        triggers="click blur"
        placement="bottom"
        custom-class="popover-body-p-0 popover-body-overflow-hidden w-100"
        @show="$root.$emit('bv::hide::tooltip')"
      >
        <advanced-link-form card no-fade :title="doc.slicedNameToString" :value="1" :link="documentLink" />
      </b-popover>
      <b-tooltip target="popover-document-share" triggers="hover">
        {{ $t('search.nav.share') }}
      </b-tooltip>
      <document-actions
        :document="doc"
        :is-download-allowed="isDownloadAllowed(doc)"
        class="document-navbar__actions d-flex"
        download-btn-group-class="order-2"
        download-btn-class="btn btn-secondary btn-sm py-0 ml-1"
        download-btn-label
        display-download-without-metadata
        no-btn-group
        popup-btn-class="btn btn-link text-white py-0 px-2"
        star-btn-class="btn btn-link text-white py-0 px-2"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

import DocumentActions from '@/components/DocumentActions'
import UserDisplay from '@/components/UserDisplay'
import utils from '@/mixins/utils'

/**
 * Document navbar in the context of a search.
 */
export default {
  name: 'SearchDocumentNavbar',
  components: {
    DocumentActions,
    UserDisplay
  },
  mixins: [utils],
  props: {
    /**
     * Shrink the layout of the navbar.
     */
    isShrinked: {
      type: Boolean
    }
  },
  computed: {
    ...mapState('document', ['doc', 'isRecommended', 'recommendedBy']),
    query() {
      return this.$store.getters['search/toRouteQuery']()
    },
    documentLink() {
      const route = this.$router.resolve({ name: 'document-standalone', params: this.doc.routerParams })
      const { protocol, host, pathname } = window.location
      return [protocol, '//', host, pathname, route.href].join('')
    },
    markAsRecommendedLabel() {
      return this.isRecommended ? this.$t('search.nav.unmarkAsRecommended') : this.$t('search.nav.markAsRecommended')
    },
    markAsRecommendedVariant() {
      return this.isRecommended ? 'success' : 'light'
    }
  },
  mounted() {
    this.saveComponentHeight()
  },
  updated() {
    this.saveComponentHeight()
  },
  methods: {
    back() {
      this.$router.push({ name: 'search', query: this.query })
    },
    isDownloadAllowed({ index }) {
      return !!this.$store.state.downloads.allowedFor[index]
    },
    saveComponentHeight() {
      const height = `${this.$el.offsetHeight}px`
      // Save component height in a CSS variable after it's been update
      this.$root.$el.style.setProperty('--document-navbar-height', height)
    },
    async toggleAsRecommended() {
      await this.$store.dispatch('document/toggleAsRecommended', await this.$core.auth.getUsername())
      await this.$store.dispatch('recommended/fetchIndicesRecommendations')
    },
    scrollToTop() {
      document.getElementById('search__body__document__wrapper').scrollTop = 0
    }
  }
}
</script>

<style lang="scss">
.document-navbar {
  align-items: center;
  display: flex;
  margin: 0;

  @media (max-width: $document-float-breakpoint-width) {
    border-radius: 0;
    margin: 0;
  }

  &__back,
  &__back:hover {
    color: inherit;
    display: inline;
    font-size: $font-size-sm;
  }

  &__back .svg-inline--fa {
    transition: 500ms transform;
  }

  &--shrinked &__back .svg-inline--fa {
    transform: scale(1.3);
  }

  &__back__label {
    position: absolute;
  }

  &__title,
  &__back__label {
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

    &:before,
    &:after {
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
