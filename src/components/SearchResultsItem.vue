<template>
  <div class="search-results-item" :class="{ 'search-results-item--active': isActive() }">
    <h5 class="search-results-item__basename">
      <router-link :to="{ name: 'document', params: { id: doc.id, routing: doc.routing } }">
        {{ doc.basename }}
      </router-link>
    </h5>

    <router-link :to="{ name: 'search', query: folderParams }" class="search-results-item__location">
      <font-awesome-icon icon="folder" class="mr-1" />
      {{ location }}
    </router-link>

    <div class="search-results-item__fragments" v-if="doc.highlight" v-html="doc.highlight.content.join(' [...] ')"></div>

    <ul class="named-entities list-inline">
      <li class="named-entity list-inline-item" v-for="ne in namedEntities" :key="ne._source.id" :title="ne._source.category + '/' + ne._source.extractor + '/' + ne._source.offset">
        <router-link :to="{ name: 'document', params: { id: doc.id } }" class="badge badge-pill badge-primary">
          {{ ne._source.mention}}
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import get from 'lodash/get'
import uniqBy from 'lodash/uniqBy'
import settings from '@/utils/settings'

export default {
  name: 'SearchResultsItem',
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
      // Remove the base name
      parts.splice(-1, 1)
      // And return the new path
      return parts.join('/') + '/'
    },
    location () {
      // Remove the base folder
      return this.folder.replace(settings.document.base, '')
    },
    folderParams () {
      return { q: `path:"${this.folder}"` }
    },
    namedEntities () {
      return uniqBy(this.doc.get('innerHits.NamedEntity.hits.hits', []), '_source.mention')
    }
  }
}
</script>

<style lang="scss">
  .search-results-item {
    padding: $spacer;
    border-bottom: 1px solid $gray-200;

    &--active {
      position: relative;

      &:before {
        content: "";
        background: theme-color('primary');
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        width: 3px;
        box-shadow: 0 0 10px 0 theme-color('primary');
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
      color: mix(theme-color('info'), white)
    }

    &__fragments {
      font-size: 0.9em;
      color: $text-muted;
    }

  }
</style>
