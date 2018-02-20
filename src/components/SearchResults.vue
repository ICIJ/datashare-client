<template>
  <div class="search-results list">
    <div class="item" v-for="item in results" :key="item._id">
      <p v-if="item._source.type === 'Document'">document : {{item._source.path}}</p>
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
