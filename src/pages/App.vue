<template>
  <div class="app d-flex">
    <div class="app__sidebar">
      <app-sidebar />
    </div>
    <div class="app__main flex-grow-1 d-flex" :class="{ 'app__main--has-context-sidebar': doesRouteHaveSidebar }">
      <vue-perfect-scrollbar class="app__main__context-sidebar p-1" v-if="!isContextSidebarReduced">
        <router-view name="sidebar" />
      </vue-perfect-scrollbar>
      <div class="app__main__view flex-grow-1">
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

import AppSidebar from '@/components/AppSidebar'
import ScrollTracker from '@/components/ScrollTracker'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'App',
  components: {
    AppSidebar,
    ScrollTracker,
    VuePerfectScrollbar
  },
  computed: {
    matchedRouteNames () {
      return compact(this.$route.matched.map(r => r.name))
    },
    isSearchRoute () {
      return this.matchedRouteNames.indexOf('search') > -1
    },
    isHiddingFiltersPanel () {
      return this.isSearchRoute && !this.$store.state.search.showFilters
    },
    doesRouteHaveSidebar () {
      return some(this.$route.matched, ({ components }) => {
        return !!components.sidebar
      })
    },
    isContextSidebarReduced () {
      return this.isHiddingFiltersPanel || !this.doesRouteHaveSidebar
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
    background: $app-sidebar-bg;
    transition: filter 200ms;

    .modal-open & {
      filter: blur(3.24px);
    }

    @media (max-width: $app-sidebar-float-breakpoint-width) {
      &__main {
        margin-left: $app-sidebar-reduced-width;
      }
    }

    &__main {
      box-shadow: $box-shadow-lg;
      background: $body-bg;
      padding-bottom: 0;

      &--has-context-sidebar {
        background: $app-context-sidebar-bg;
      }

      &, &--has-context-sidebar &__view {
        mask:  0 0 no-repeat luminance url('../assets/images/corner-top.svg'),
        0 100% no-repeat luminance url('../assets/images/corner-bottom.svg'),
        0 0 no-repeat luminance linear-gradient(white 0%, white 100%);
        mask-composite: exclude;
      }

      & &__context-sidebar {
        position: sticky;
        top: 0;
        left: 0;
        height: 100vh;
        max-height: 100vh;
        background: $app-context-sidebar-bg;
        color: $app-context-sidebar-color;
        width: $app-context-sidebar-width;
        max-width: $app-context-sidebar-width;
        min-width: $app-context-sidebar-width;
      }

      & &__view {
        background: $body-bg;
      }
    }

  }
</style>
