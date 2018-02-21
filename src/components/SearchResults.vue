<template>
  <div class="search-results list">
    <div class="item" v-for="item in results" :key="item.score">
      <p v-if="item._source.type === 'Document'">
        document : {{item._source.path}}
        <span class="fragment" v-for="fragment in item.highlight.content" v-html="fragment" :key="fragment"></span>
      </p>
      <p v-if="item._source.type === 'NamedEntity'">named entity : {{item._source.mention}} ({{item._source.category}}, offset {{item._source.offset}})</p>
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
  .fragment {
    display: block;
    color: #7f7f7f;
    margin-left: 1em;
  }
</style>
