<template>
  <div class="app">
    <app-nav />
    <router-view />
    <app-footer />
    <vue-progress-bar />
  </div>
</template>

<script>
import DatashareClient from '@/api/DatashareClient'
import AppFooter from './AppFooter'
import AppNav from './AppNav'

export default {
  name: 'App',
  components: {
    AppFooter,
    AppNav
  },
  created () {
    if (process.env.NODE_ENV === 'production') {
      new DatashareClient().createIndex()
    }
  }
}
</script>

<style lang="scss">
  .app {
    margin-top: $app-nav-height;
    margin-bottom: $app-footer-height;
  }
</style>
