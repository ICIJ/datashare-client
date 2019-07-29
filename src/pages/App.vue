<template>
  <div class="app d-flex">
    <div class="app__sidebar">
      <app-sidebar />
    </div>
    <div class="app__main flex-grow-1 d-flex">
      <vue-perfect-scrollbar class="app__main__aggregations-panel">
        <aggregations-panel v-if="['search', 'document'].indexOf($route.name) > -1" />
      </vue-perfect-scrollbar>
      <div class="flex-grow-1">
        <app-nav v-if="['search', 'document'].indexOf($route.name) > -1" />
        <router-view />
        <app-footer />
        <scroll-tracker />
        <vue-progress-bar />
      </div>
    </div>
  </div>
</template>

<script>
import AggregationsPanel from '@/components/AggregationsPanel'
import DatashareClient from '@/api/DatashareClient'
import AppFooter from '@/components/AppFooter'
import AppNav from '@/components/AppNav'
import AppSidebar from '@/components/AppSidebar'
import ScrollTracker from '@/components/ScrollTracker'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'App',
  components: {
    AggregationsPanel,
    AppFooter,
    AppNav,
    AppSidebar,
    ScrollTracker,
    VuePerfectScrollbar
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
    --app-sidebar-width: #{$app-sidebar-width};

    background: $app-bg;
    min-height: 100vh;

    &__main {
      background: $body-bg;
      padding-bottom: var(--app-footer-height);
      mask:  0 0 no-repeat luminance url('../assets/images/corner-top.svg'),
             0 0 no-repeat luminance linear-gradient(white 0%, white 100%);
      mask-composite: exclude;

      &__aggregations-panel {
        height: calc(100vh -  var(--app-footer-height));
        background: $aggregations-panel-bg;
      }
    }
  }
</style>
