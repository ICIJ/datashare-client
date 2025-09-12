<template>
  <div
    class="app"
    :style="style"
  >
    <hook name="app:before" />
    <app-sidebar ref="sidebar" />
    <div class="app__view">
      <router-view v-slot="{ Component }">
        <component :is="Component">
          <template
            v-if="hasFilters"
            #filters
          >
            <component :is="FiltersComponent" />
          </template>
        </component>
      </router-view>
      <scroll-tracker />
    </div>
    <page-offcanvas
      v-if="hasSettings"
      v-model="showPageSettings"
      no-header
    >
      <template #default="{ visible, placement, hide }">
        <component
          :is="settingComponent"
          :key="route.name"
          :visible="visible"
          :placement="placement"
          @hide="hide()"
        />
      </template>
    </page-offcanvas>
    <b-modal-orchestrator />
    <hook name="app:after" />
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, useTemplateRef } from 'vue'
import { compact, get, property } from 'lodash'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppSidebar from '@/components/AppSidebar/AppSidebar'
import Hook from '@/components/Hook/Hook'
import PageOffcanvas from '@/components/PageOffcanvas/PageOffcanvas'
import ScrollTracker from '@/components/ScrollTracker'
import { useCore } from '@/composables/useCore'
import { useAppStore } from '@/store/modules'

const { core } = useCore()
const appStore = useAppStore()
const { t } = useI18n()
const route = useRoute()
const sidebar = useTemplateRef('sidebar')

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

const style = computed(() => {
  return {
    '--app-sidebar-width': `${sidebar.value?.width ?? 0}px`
  }
})

const hasSettings = computed(() => {
  return route?.meta?.settings !== false && !!settingComponent.value
})

const settingComponent = computed(() => {
  return compact(route.matched.map(property('components.settings'))).pop()
})

const showPageSettings = computed({
  get: () => hasSettings.value && !appStore.settings.closed,
  set: value => (appStore.settings.closed = !value)
})

const hasFilters = computed(() => {
  return route.matched.some(route => !!get(route, 'components.filters', false))
})

const FiltersComponent = computed(() => {
  return route.matched.map(property('components')).findLast(components => 'filters' in components)?.filters
})

onMounted(async () => {
  core?.on('http::error', handleHttpError)
})

onBeforeUnmount(() => {
  core?.off('http::error', handleHttpError)
})
</script>

<style lang="scss" scoped>
.app {
  --app-nav-height: #{$app-nav-height};
  --app-sidebar-width: 0px;

  min-height: 100vh;
  display: flex;

  &__view {
    flex: 1 1 auto;
    max-width: calc(100vw - var(--app-sidebar-width));

    &:has(.table-responsive) {
      overflow-x: hidden;
    }
  }

}
</style>
