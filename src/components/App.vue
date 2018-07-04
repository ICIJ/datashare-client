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
import { DatashareClient } from '@/api/datashare'

export default {
  name: 'App',
  components: { AppNav },
  created () {
    if (process.env.NODE_ENV === 'production') {
      new DatashareClient().createIndex()
    }
  },
  methods: {
    getConfig (name) {
      return process.env.CONFIG[name]
    }
  }
}
</script>
