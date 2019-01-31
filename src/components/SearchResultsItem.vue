<template>
  <div class="search-results-item" :class="{ 'search-results-item--active': isActive() }">
    <h5 class="search-results-item__basename">
      <router-link :to="{ name: 'document', params: { id: doc.id, routing: doc.routing } }">
        {{ doc.basename }}
      </router-link>
    </h5>
    <span class="search-results-item__location small">
      <font-awesome-icon icon="folder" class="mr-1" />
      {{ location }}
    </span>
    <div class="search-results-item__fragments" v-if="doc.highlight" v-html="doc.highlight.content.join(' [...] ')"></div>
    <ul class="named-entities list-inline mt-3">
      <li class="named-entity list-inline-item" v-for="ne in namedEntities" :key="ne._source.id" :title="ne._source.category + '/' + ne._source.extractor + '/' + ne._source.offset">
        <router-link :to="{ name: 'document', params: { id: doc.id } }" class="badge badge-pill text-white" :class="getCategoryClass(ne._source.category, 'bg-')" v-b-tooltip.hover :title=" ne._source.mention">
          <font-awesome-icon :icon="getCategoryIcon(ne._source.category)" class="mr-1" />
          {{ ne._source.mention | truncate }}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'
import ner from '@/mixins/ner'

export default {
  name: 'SearchResultsItem',
  mixins: [ner],
  props: ['doc'],
  methods: {
    isActive () {
      return this.$route.name === 'document' && get(this.$store.state, 'document.doc.id') === this.doc.id
    }
  },
  computed: {
    folder () {
      // Extract location parts
      let parts = this.doc.get('_source.path', '').split('/')
      // Remove the file name
      parts.splice(-1, 1)
      // And return the new path
      return parts.join('/') + '/'
    },
    location () {
      return '.' + this.folder.split(get(this, 'config.dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
    },
    folderParams () {
      return { q: `path:${this.folder}*` }
    },
    namedEntities () {
      return uniqBy(this.doc.get('inner_hits.NamedEntity.hits.hits', []), '_source.mention')
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
  .search-results-item {
    padding: $spacer;
    border-bottom: 1px solid $gray-200;

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
        background: $secondary;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 3px;
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

    &__fragments {
      font-size: 0.9em;
      color: $text-muted;
    }

  }
</style>
