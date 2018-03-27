<template>
  <div class="search-results">
    <div v-if="query && response.hits.length > 0">
      <h4 class="search-results__header">
        {{ $tc('search.results.results', response.hits.length, {total: response.get('hits.total'), query}) }}
      </h4>
      <div class="search-results__items">
        <div class="search-results__items__item" v-for="doc in response.hits" :key="doc.id">
          <h5>
            <router-link :to="{ name: 'document', params: { id: doc.id, routing: doc.routing } }">
              {{ doc.basename }}
            </router-link>
          </h5>

          <div class="search-results__items__item__fragments" v-if="doc.highlight" v-html="doc.highlight.content.join(' [...] ')"></div>

          <ul class="named-entities list-inline">
            <li class="named-entity list-inline-item" v-for="ne in doc.get('innerHits.NamedEntity.hits.hits', [])" :key="ne._source.id" :title="ne._source.category + '/' + ne._source.extractor + '/' + ne._source.offset">
              <router-link :to="{ name: 'document', params: { id: doc.id } }" class="badge badge-pill badge-primary">
                {{ ne._source.mention}}
              </router-link>
            </li>
          </ul>

          <router-link :to="{ name: 'document', params: { id: doc.id, routing: doc.routing } }" class="search-results__items__item__link text-muted">
            <font-awesome-icon icon="file-alt" />
            {{ doc.source.path }}
          </router-link>
        </div>
      </div>
    </div>
    <div v-else>
      <h4 class="search-results__header">
        {{ $t('search.results.no-result', { query }) }}
      </h4>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: ['response', 'query']
}
</script>

<style lang="scss">
  .search-results {

    &__header {
      padding: $spacer;
      border-bottom: 1px solid $gray-200;
    }

    &__items {

      &__item {
        padding: $spacer;
        border-bottom: 1px solid $gray-200;

        &__fragments {
          font-size: 0.9em;
          color: $text-muted;
        }

        &__link {
          display: block;
          white-space: nowrap;
          width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
</style>
