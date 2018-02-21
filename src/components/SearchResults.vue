<template>
  <div class="search-results list">
    <div class="item" v-for="item in results" :key="item.score">
      document : {{item._source.path}}
      <div class="fragments">
        {{$t('search.results.match')}}:
        <span class="fragment" v-for="fragment in item.highlight.content" v-html="fragment" :key="fragment"></span>
      </div>
      <div class="named-entities">
        {{$t('search.results.entities')}}: <b>{{ item.inner_hits.NamedEntity.hits.total }}</b>
        <span class="named-entity" v-for="ne in item.inner_hits.NamedEntity.hits.hits" :key="ne._id">{{ne._source.mention}} ({{ne._source.category}}/{{ne._source.offset}})</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'search-results',
  props: ['results']
}
</script>

<style scoped>
  .fragments, .named-entities {
    color: #7f7f7f;
    margin-left: 1em;
  }
  .fragment, .named-entity {
    margin-left: 5px;
  }
</style>
