<template>
  <router-link :to="{ name: 'document', params, query: { q: query } }" class="search-results-list-link d-flex align-self-stretch flex-nowrap">
    <document-thumbnail :document="document" class="search-results-list-link__thumbnail" crop lazy />
    <div class="search-results-list-link__wrapper">
      <span class="search-results-list-link__basename">
        <document-sliced-name :document="document" />
      </span>
      <active-text-truncate class="search-results-list-link__location">
        <fa icon="folder" class="mr-1" />
        {{ location }}
      </active-text-truncate>
      <div class="search-results-list-link__fragments" v-if="document.highlight" v-html="document.highlight.content.join(' [...] ')"></div>
    </div>
  </router-link>
</template>

<script>
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
    ...mapState('search', ['query']),
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
    }
  },
  filters: {
    truncate (text = '', length = 30, clamp = '...') {
      if (text.length <= length) return text

      let truncated = text.slice(0, length - clamp.length)
      let last = truncated.length - 1

      while (last > 0 && truncated[last] !== ' ' && truncated[last] !== clamp[0]) {
        last -= 1
      }
      // Fix for case when text dont have any `space`
      last = last || length - clamp.length
      truncated = truncated.slice(0, last)
      return truncated + clamp
    }
  }
}
</script>

<style lang="scss">
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
      position: relative;
      outline: 0;

      &:before {
        content: "";
        border-left: 2px solid $secondary;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        box-shadow: 0 0 10px 0 $secondary;
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
      display: block;
      color: $text-muted;
      font-size: $font-size-sm;
    }

    &__fragments {
      margin-top: $spacer * 0.5;
      font-size: $font-size-sm;
      color: $body-color;
    }

  }
</style>
