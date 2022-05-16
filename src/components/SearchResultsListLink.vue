<template>
  <router-link class="search-results-list-link d-flex align-self-stretch flex-nowrap"
               :to="{ name: 'document', params, query: { q: query } }">
    <document-thumbnail :document="document" class="search-results-list-link__thumbnail" crop lazy />
    <div class="search-results-list-link__wrapper">
      <span class="search-results-list-link__basename d-block">
        <document-sliced-name :document="document" show-subject />
      </span>
      <active-text-truncate class="search-results-list-link__location">
        <span class="d-inline-flex align-items-center">
          <fa icon="folder" class="mr-1" />
          <b-badge variant="light" class="mr-2" v-if="showIndex">
            {{ document.index | startCase }}
          </b-badge>
          {{ location }}
        </span>
      </active-text-truncate>
      <div class="search-results-list-link__fragments"
           v-if="document.highlight"
           v-html="document.highlight.content.join(' [...] ')"></div>
    </div>
  </router-link>
</template>

<script>
import { startCase } from 'lodash'
import { mapState } from 'vuex'

import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import ner from '@/mixins/ner'

/**
 * A result link for the search results list.
 */
export default {
  name: 'SearchResultsLink',
  mixins: [ner],
  props: {
    /**
     * The document to link to.
     */
    document: {
      type: Object
    }
  },
  components: {
    DocumentSlicedName,
    DocumentThumbnail
  },
  computed: {
    ...mapState('search', ['indices', 'query']),
    folder () {
      const parts = this.document.get('_source.path', '').split('/')
      parts.splice(-1, 1)
      return parts.join('/') + '/'
    },
    location () {
      return '.' + this.folder.split(this.$config.get('dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
    },
    folderParams () {
      return { q: `path:${this.folder}*` }
    },
    params () {
      return this.document.routerParams
    },
    index () {
      return this.document.index
    },
    showIndex () {
      return this.indices.length > 1 && !this.location.startsWith(`./${this.index}`)
    }
  },
  filters: {
    startCase
  },
  methods: {

  }
}
</script>
<style lang="scss" scoped>
  .search-results-list-link {
    display: block;

    &:visited:not(.router-link-active) &__basename {
      color: mix(#609, white, 50%);
    }

    &.router-link-active,
    &.router-link-active:active,
    &.router-link-active:focus,
    &:active,
    &:focus {
      outline: 0;
      position: relative;

      &:before {
        border-left: 2px solid $secondary;
        bottom: 0;
        box-shadow: 0 0 10px 0 $secondary;
        content: "";
        left: 0;
        position: absolute;
        top: 0;
      }
    }

    &:active:before, &:focus:before {
      border-left: 2px solid $text-muted;
      box-shadow: 0 0 10px 0 $gray-500;
    }

    &__thumbnail {
      margin: $spacer;
      margin-right: 0;
    }

    &__wrapper {
      margin: $spacer;
      min-width: 0;
      flex-grow: 1;
    }

    &__basename {
      font-size: $font-size-base;
      margin: 0;
      word-break: break-all;
    }

    &__location {
      color: $text-muted;
      display: block;
      font-size: $font-size-sm;
    }

    &__fragments {
      color: $body-color;
      font-size: $font-size-sm;
      margin-top: $spacer * 0.5;
    }

  }
</style>
