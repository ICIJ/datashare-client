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
import { DatashareClient } from '@/api/DatashareClient'
import AppNav from './AppNav'

export default {
  name: 'App',
  components: { AppNav },
  created () {
    if (process.env.NODE_ENV === 'production') {
      new DatashareClient().createIndex()
    }
  }
}
</script>
