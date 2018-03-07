<template>
  <div class="app">
    <app-nav />
    <search />
  </div>
</template>

<style lang="scss">
  .app {
    margin-top: $app-nav-height;
    padding-top: $spacer;
  }
</style>

<script>
import AppNav from './AppNav'
import Search from './Search'

export default {
  name: 'App',
  components: {
    AppNav,
    Search
  }
}
</script>
