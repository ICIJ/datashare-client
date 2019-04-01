<template>
  <router-link :to="{ name: routeName, params }" class="search-results-link d-flex" :class="{ 'search-results-link--active': isActive() }">
    <document-thumbnail :document="doc" class="search-results-link__thumbnail mr-3" crop />
    <div>
      <h5 class="search-results-link__basename">
        <document-sliced-name :document="doc" />
      </h5>
      <span class="search-results-link__location small">
        <fa icon="folder" class="mr-1" />
        {{ location }}
      </span>
      <div class="search-results-item__occurrences" v-if="this.query && this.query !== '*'">
      {{ getQueryTermsOccurrences }}
    </div>
    <div class="search-results-link__fragments" v-if="doc.highlight" v-html="doc.highlight.content.join(' [...] ')"></div>
      <ul class="named-entities list-inline mt-3">
        <li class="named-entity list-inline-link" v-for="ne in namedEntities" :key="ne._source.id"
            :title="ne._source.category + '/' + ne._source.extractor + '/' + ne._source.offset">
          <router-link :to="{ name: 'document', params: { id: doc.id } }" class="badge badge-pill text-white"
                       :class="[getCategoryClass(ne._source.category, 'bg-')]" v-b-tooltip.hover :title="ne._source.mention">
            <fa :icon="getCategoryIcon(ne._source.category)" class="mr-1" />
            {{ ne._source.mention | truncate }}
          </router-link>
        </li>
      </ul>
    </div>
  </router-link>
</template>

<script>
import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import ner from '@/mixins/ner'
import { mapState } from 'vuex'
import get from 'lodash/get'
import map from 'lodash/map'
import uniqBy from 'lodash/uniqBy'

export default {
  name: 'SearchResultsLink',
  mixins: [ner],
  props: ['doc'],
  components: {
    DocumentSlicedName,
    DocumentThumbnail
  },
  methods: {
    isActive () {
      return get(this.$store.state, 'document.doc.id') === this.doc.id && this.doc.id === this.$route.params.id
    }
  },
  computed: {
    ...mapState('search', {
      query: 'query'
    }),
    folder () {
      // Extract location parts
      let parts = this.doc.get('_source.path', '').split('/')
      // Remove the file name
      parts.splice(-1, 1)
      // And return the new path
      return parts.join('/') + '/'
    },
    location () {
      return '.' + this.folder.split(this.$config.get('dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
    },
    folderParams () {
      return { q: `path:${this.folder}*` }
    },
    namedEntities () {
      return uniqBy(this.doc.get('inner_hits.NamedEntity.hits.hits', []), '_source.mention')
    },
    params () {
      return this.doc.routerParams
    },
    routeName () {
      return this.doc.isEmail ? 'email' : 'document'
    },
    getQueryTermsOccurrences () {
      let result = ''
      if (this.doc.source.content) {
        map(this.query.split(' '), query => {
          result += ` "${query}" (${(this.doc.source.content.match(new RegExp(query, 'gi')) || []).length})`
        })
      }
      return result
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
  .search-results-link {
    padding: $spacer;
    border-bottom: 1px solid $gray-200;
    display: block;

    &:hover {
      text-decoration: none;
      background: mix($secondary, white, 5%);
    }

    &:visited:not(&--active) &__basename {
      color: mix(#609, white, 50%);
    }

    & .badge {
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &--active {
      position: relative;

      &:before {
        content: "";
        border-left: 3px solid $secondary;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        box-shadow: 0 0 10px 0 $secondary;
      }
    }

    &__basename {
      font-size: 1.1em;
      margin: 0;
    }

    &__location {
      display: block;
      white-space: nowrap;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      color: $gray-500;
    }

    &__occurrences,
    &__fragments {
      font-size: 0.9em;
      color: $text-muted;
    }

  }
</style>
