<template>
  <div class="app d-flex">
    <hook name="app:before"></hook>
    <div class="app__sidebar">
      <app-sidebar></app-sidebar>
    </div>
    <div class="app__main flex-grow-1 d-flex" :class="{ 'app__main--has-context-sidebar': doesRouteHaveSidebar }">
      <vue-perfect-scrollbar v-if="!isContextSidebarReduced" class="app__main__context-sidebar p-1">
        <router-view name="sidebar"></router-view>
      </vue-perfect-scrollbar>
      <div class="app__main__view flex-grow-1">
        <scroll-tracker></scroll-tracker>
        <router-view></router-view>
      </div>
    </div>
    <vue-progress-bar></vue-progress-bar>
    <b-toast id="logged-out-toast" variant="danger" no-close-button no-auto-hide>
      <p>
        {{ $t('login.logout') }}
      </p>
      <div class="d-flex">
        <b-button :href="signinUrl" variant="danger" class="ml-auto">
          {{ $t('login.login') }}
        </b-button>
      </div>
    </b-toast>
    <hook name="app:after"></hook>
  </div>
</template>

<script>
import { compact, get, some } from 'lodash'

import AppSidebar from '@/components/AppSidebar'
import Hook from '@/components/Hook'
import ScrollTracker from '@/components/ScrollTracker'
import { EventBus } from '@/utils/event-bus'
import VuePerfectScrollbar from 'vue-perfect-scrollbar'

export default {
  name: 'App',
  components: {
    AppSidebar,
    Hook,
    ScrollTracker,
    VuePerfectScrollbar
  },
  computed: {
    signinUrl() {
      return process.env.VUE_APP_DS_AUTH_SIGNIN
    },
    matchedRouteNames() {
      return compact(this.$route.matched.map((r) => r.name))
    },
    isSearchRoute() {
      return this.matchedRouteNames.indexOf('search') > -1
    },
    isHiddingFiltersPanel() {
      return this.isSearchRoute && !this.$store.state.search.showFilters
    },
    doesRouteHaveSidebar() {
      return some(this.$route.matched, ({ components }) => {
        return !!components.sidebar
      })
    },
    isContextSidebarReduced() {
      return this.isHiddingFiltersPanel || !this.doesRouteHaveSidebar
    }
  },
  created() {
    EventBus.$on('http::error', this.handleHttpError)
  },
  beforeDestroy() {
    EventBus.$off('http::error', this.handleHttpError)
  },
  methods: {
    handleHttpError(err) {
      const code = get(err, 'request.response.status') || get(err, 'response.status')
      if (code === 401) {
        this.$bvToast.show('logged-out-toast')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.app {
  // In CSS variables so they can be updated
  --app-nav-height: #{$app-nav-height};
  --app-sidebar-width: #{$app-sidebar-width};

  background: $app-sidebar-bg;
  min-height: 100vh;
  transition: filter 200ms;
  margin-left: $app-sidebar-reduced-width;

  &__main {
    background: $body-bg;
    box-shadow: $box-shadow-lg;
    padding-bottom: 0;

    &--has-context-sidebar {
      background: $app-context-sidebar-bg;
    }

    &,
    &--has-context-sidebar &__view {
      mask: 0 0 no-repeat luminance url('../assets/images/corner-top.svg'),
        0 100% no-repeat luminance url('../assets/images/corner-bottom.svg'),
        0 0 no-repeat luminance linear-gradient(white 0%, white 100%);
      mask-composite: exclude;
    }

    & &__context-sidebar {
      background: $app-context-sidebar-bg;
      color: $app-context-sidebar-color;
      height: 100vh;
      left: 0;
      max-height: 100vh;
      max-width: $app-context-sidebar-width;
      min-width: $app-context-sidebar-width;
      position: sticky;
      top: 0;
      width: $app-context-sidebar-width;
    }

    & &__view {
      background: $body-bg;
    }
  }
}
</style>
