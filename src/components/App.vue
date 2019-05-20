<template>
  <div class="app">
    <app-nav />
    <router-view />
    <app-footer />
    <vue-progress-bar />
    <portal-target name="modal-outlet" />
    <portal-target name="tooltip-outlet" />
  </div>
</template>

<script>
import DatashareClient from '@/api/DatashareClient'
import AppFooter from './AppFooter'
import AppNav from './AppNav'
import { PortalTarget } from 'portal-vue'

export default {
  name: 'App',
  components: {
    AppFooter,
    AppNav,
    PortalTarget
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
