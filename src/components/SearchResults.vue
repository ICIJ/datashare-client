<template>
  <div class="search-results">
    <div v-if="query">
      <h3>{{ $t('search.results.results', {total: response.total, query}) }}</h3>
      <div class="search-results__item mb-4" v-for="doc in response.hits" :key="doc.id">
        <router-link :to="{ name: 'document', params: { id: doc.id } }">
          <font-awesome-icon icon="file-alt" />
          {{ doc.source.path }}
        </router-link>

        <div class="named-entities">
          {{$t('search.results.entities')}}: <b>{{ doc.innerHits.NamedEntity.hits.total }}</b>
          <span class="named-entity" v-for="ne in doc.innerHits.NamedEntity.hits.hits" :key="ne._id">{{ne._source.mention}} ({{ne._source.category}}/{{ne._source.extractor}}/{{ne._source.offset}})</span>
        </div>
        <div class="fragments">
          {{$t('search.results.match')}}:
          <span class="fragment" v-for="fragment in doc.highlight.content" v-html="fragment" :key="fragment"></span>
        </div>
      </div>
    </div>
    <div v-else-if="response.mentions">
      <div class="search-results__item" v-for="item in response.mentions.buckets" :key="item.key">
        <router-link :to="{ name: 'search', query: { query: item.key }}">
          {{item.key}}
        </router-link>
        <span class="aggregation">{{item.doc_count}} occurences, {{item.docs.value}} documents</span>
      </div>
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
  .fragments, .named-entities, .aggregation {
    color: #7f7f7f;
    margin-left: 1em;
  }
  .fragment, .named-entity {
    margin-left: 5px;
  }
</style>
