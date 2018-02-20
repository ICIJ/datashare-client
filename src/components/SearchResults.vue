<template>
  <div class="search-results list">
    <div class="item" v-for="item in results" :key="item._id">
      {{ item._source.path}}
    </div>
  </div>
</template>

<script>
export default {
  name: 'search-results',
  props: ['results']
}
</script>
