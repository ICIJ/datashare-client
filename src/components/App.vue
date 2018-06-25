<template>
  <div class="app">
    <app-nav />
    <router-view />
    <vue-progress-bar />
  </div>
</template>

<style lang="scss">
  .app {
    margin-top: $app-nav-height;
  }
</style>

<script>
import AppNav from './AppNav'
import {DatashareClient} from '@/api/datashare'

export default {
  name: 'App',
  components: { AppNav },
  created () {
    new DatashareClient().createIndex()
  }
}
</script>
