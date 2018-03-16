<template>
  <div class="search-results">
    <div v-if="query && response.hits.length > 0">
      <h3>{{ $tc('search.results.results', response.hits.length, {total: response.hits.length, query}) }}</h3>
      <div class="search-results__item mt-5" v-for="doc in response.hits" :key="doc.id">
        <h4>
          <router-link :to="{ name: 'document', params: { id: doc.id }, query: { routing: doc.routing } }">
            {{ doc.basename }}
          </router-link>
        </h4>

        <div class="fragments" v-html="doc.highlight.content.join(' [...] ')"></div>

        <ul class="named-entities list-inline">
          <li class="named-entity list-inline-item" v-for="ne in doc.innerHits.NamedEntity.hits.hits" :key="ne._source.id" :title="ne._source.category + '/' + ne._source.extractor + '/' + ne._source.offset">
            <router-link :to="{ name: 'document', params: { id: doc.id } }" class="badge badge-pill badge-primary">
              {{ ne._source.mention}}
            </router-link>
          </li>
        </ul>

        <router-link :to="{ name: 'document', params: { id: doc.id }, query: { routing: doc.routing } }" class="search-results__item__link text-muted">
          <font-awesome-icon icon="file-alt" />
          {{ doc.source.path }}
        </router-link>
      </div>
    </div>
    <div v-else>
      <h3>{{ $t('search.results.no-result', { query }) }}</h3>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: ['response', 'query']
}
</script>

<style lang="scss" scoped>
</style>
