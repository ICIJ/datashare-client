<template>
  <div class="app d-flex" :style="style">
    <hook name="app:before" />
    <app-sidebar ref="app-sidebar" />
    <div class="flex-grow-1">
      <router-view v-slot="{ Component }">
        <component :is="Component">
          <template v-if="hasFilters" #filters>
            <component :is="FiltersComponent" />
          </template>
        </component>
      </router-view>
      <scroll-tracker />
    </div>
    <page-offcanvas v-model="showPageSettings" no-header>
      <template #default="{ visible, placement, hide }">
        <router-view v-slot="{ Component }" name="settings">
          <component :is="Component" :hide="hide" :visible="visible" :placement="placement" />
        </router-view>
      </template>
    </page-offcanvas>
    <b-modal-orchestrator />
    <hook name="app:after" />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { get, property } from 'lodash'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import AppSidebar from '@/components/AppSidebar/AppSidebar'
import Hook from '@/components/Hook/Hook'
import PageOffcanvas from '@/components/PageOffcanvas/PageOffcanvas'
import ScrollTracker from '@/components/ScrollTracker'
import { useCore } from '@/composables/core'
import { useResizeObserver } from '@/composables/resize-observer'
import { useAppStore } from '@/store/modules/app'
import { useDownloadsStore } from '@/store/modules/downloads'

const { core } = useCore()
const store = useStore()
const appStore = useAppStore()
const downloadsStore = useDownloadsStore()
const { t } = useI18n()
const route = useRoute()

const signinUrl = computed(() => import.meta.env.VITE_DS_AUTH_SIGNIN)

// Function to handle HTTP errors
const handleHttpError = (err) => {
  const code = get(err, 'request.response.status') || get(err, 'response.status')
  if (code === 401) {
    const body = t('login.logout')
    const linkLabel = t('login.login')
    const href = signinUrl.value
    core.toast.error(body, { href, linkLabel, autoClose: false })
  }
}

const hasSettings = computed(() => {
  return route.matched.some((route) => 'settings' in route.components)
})

const showPageSettings = computed({
  get: () => hasSettings.value && !appStore.settings.closed,
  set: (value) => (appStore.settings.closed = !value)
})

const hasFilters = computed(() => {
  return route.matched.some((route) => !!get(route, 'components.filters', false))
})

const FiltersComponent = computed(() => {
  return route.matched.map(property('components')).findLast((components) => 'filters' in components)?.filters
})

const appSidebarRef = useTemplateRef('app-sidebar')
const { state: appSidebarState } = useResizeObserver(appSidebarRef)

const style = computed(() => {
  return {
    '--app-sidebar-width': `${appSidebarState.contentRect.width}px`
  }
})

onMounted(async () => {
  core.on('http::error', handleHttpError)
  // Check if "download" functionality is available for all the available indices
  await downloadsStore.fetchIndicesStatus(store.state.search.indices)
})

onBeforeUnmount(() => {
  core?.off('http::error', handleHttpError)
})
</script>

<style lang="scss" scoped>
.app {
  --app-nav-height: #{$app-nav-height};
  --app-sidebar-width: #{$app-sidebar-width};

  min-height: 100vh;
}
</style>
