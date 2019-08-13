<template>
  <div class="app d-flex">
    <div class="app__sidebar">
      <app-sidebar />
    </div>
    <div class="app__main flex-grow-1 d-flex">
      <vue-perfect-scrollbar class="app__main__context-sidebar">
        <transition name="slide-left">
          <router-view name="sidebar" />
        </transition>
      </vue-perfect-scrollbar>
      <div class="flex-grow-1">
        <scroll-tracker />
        <vue-progress-bar />
        <router-view />
      </div>
    </div>
  </div>
</template>

<script>
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
  }
}
</script>

<style lang="scss">
  .app {
    // In CSS variables so they can be updated
    --app-nav-height: #{$app-nav-height};
    --app-sidebar-width: #{$app-sidebar-width};

    background: $app-bg;
    min-height: 100vh;

    &__main {
      box-shadow: $box-shadow-lg;
      background: $body-bg;
      padding-bottom: 0;
      mask:  0 0 no-repeat luminance url('../assets/images/corner-top.svg'),
             0 100% no-repeat luminance url('../assets/images/corner-bottom.svg'),
             0 0 no-repeat luminance linear-gradient(white 0%, white 100%);
      mask-composite: exclude;

      &__context-sidebar {
        position: sticky;
        top: 0;
        height: 100vh;
        background: $aggregations-panel-bg;

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
