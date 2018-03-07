<template>
  <div class="search-results">
    <div v-if="query">
      <h3>{{ $t('search.results.results', {total: results.total, query}) }}</h3>
      <div class="search-results__item mb-4" v-for="item in results.hits" :key="item._id">
        <router-link :to="{ name: 'document', params: { _id: item._id } }">
          <font-awesome-icon icon="file-alt" />
          {{ item._source.path }}
        </router-link>
        <div class="named-entities">
          {{$t('search.results.entities')}}: <b>{{ item.inner_hits.NamedEntity.hits.total }}</b>
          <span class="named-entity" v-for="ne in item.inner_hits.NamedEntity.hits.hits" :key="ne._id">{{ne._source.mention}} ({{ne._source.category}}/{{ne._source.extractor}}/{{ne._source.offset}})</span>
        </div>
        <div class="fragments">
          {{$t('search.results.match')}}:
          <span class="fragment" v-for="fragment in item.highlight.content" v-html="fragment" :key="fragment"></span>
        </div>
      </div>
    </div>
    <div v-else-if="results.mentions">
      <div class="search-results__item" v-for="item in results.mentions.buckets" :key="item.key">
        <a href="#" @click="$emit('update:query', item.key)">{{item.key}}</a>
        <span class="aggregation">{{item.doc_count}} occurences, {{item.docs.value}} documents</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchResults',
  props: ['results', 'query']
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
