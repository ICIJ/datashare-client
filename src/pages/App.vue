<template>
  <div class="app d-flex">
    <div class="app__sidebar">
      <app-sidebar />
    </div>
    <div class="app__main flex-grow-1 d-flex">
      <vue-perfect-scrollbar class="app__main__context-sidebar" v-if="!isContextSidebarReduced">
        <transition name="slide-left">
          <router-view name="sidebar" />
        </transition>
      </vue-perfect-scrollbar>
      <div class="flex-grow-1">
        <scroll-tracker />
        <router-view />
      </div>
    </div>
    <vue-progress-bar />
  </div>
</template>

<script>
import compact from 'lodash/compact'
import some from 'lodash/some'

import AggregationsPanel from '@/components/AggregationsPanel'
import DatashareClient from '@/api/DatashareClient'
import AppSidebar from '@/components/AppSidebar'
import ScrollTracker from '@/components/ScrollTracker'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'App',
  components: {
    AggregationsPanel,
    AppSidebar,
    ScrollTracker,
    VuePerfectScrollbar
  },
  created () {
    if (process.env.NODE_ENV === 'production') {
      new DatashareClient().createIndex()
    }
  },
  computed: {
    matchedRouteNames () {
      return compact(this.$route.matched.map(r => r.name))
    },
    isSearchRoute () {
      return this.matchedRouteNames.indexOf('search') > -1
    },
    isHiddingAggregationsPanel () {
      return this.isSearchRoute && !this.$store.state.search.showFilters
    },
    doesRouteHaveSidebar () {
      return some(this.$route.matched, ({ components }) => {
        return !!components.sidebar
      })
    },
    isContextSidebarReduced () {
      return this.isHiddingAggregationsPanel || !this.doesRouteHaveSidebar
    }
  }
}
</script>

<style lang="scss">
  .app {
    // In CSS variables so they can be updated
    --app-nav-height: #{$app-nav-height};
    --app-sidebar-width: #{$app-sidebar-width};

    min-height: 100vh;
    background: $app-bg;

    @media (max-width: $app-sidebar-float-breakpoint-width) {

      &__main {
        margin-left: $app-sidebar-reduced-width;
      }
    }

    &__main {
      box-shadow: $box-shadow-lg;
      background: $body-bg;
      padding-bottom: 0;
      mask:  0 0 no-repeat luminance url('../assets/images/corner-top.svg'),
             0 100% no-repeat luminance url('../assets/images/corner-bottom.svg'),
             0 0 no-repeat luminance linear-gradient(white 0%, white 100%);
      mask-composite: exclude;

      & &__context-sidebar {
        position: sticky;
        top: 0;
        left: 0;
        height: 100vh;
        max-height: 100vh;
        background: $aggregations-panel-bg;
        width: $app-context-sidebar-width;
        max-width: $app-context-sidebar-width;
        min-width: $app-context-sidebar-width;

        /**
         * Disabled
        & > .slide-left-enter-active,
        & > .slide-left-leave-active {
          transition: .2s;
        }

        & > .slide-left-enter,
        & > .slide-left-leave-to {
          transform: translateX(-100%);
        } */
      }
    }
  }
</style>
