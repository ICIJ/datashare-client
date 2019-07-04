<template>
  <div class="app">
    <app-nav />
    <router-view />
    <app-footer />
    <scroll-tracker />
    <vue-progress-bar />
  </div>
</template>

<script>
import DatashareClient from '@/api/DatashareClient'
import AppFooter from '@/components/AppFooter'
import AppNav from '@/components/AppNav'
import ScrollTracker from '@/components/ScrollTracker'

export default {
  name: 'App',
  components: {
    AppFooter,
    AppNav,
    ScrollTracker
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
    // In CSS variables so they can be updated
    --app-nav-height: #{$app-nav-height};
    --app-footer-height: #{$app-footer-height};
    margin-bottom: var(--app-footer-height);
  }
</style>
